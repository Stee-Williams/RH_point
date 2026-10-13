<?php

namespace App\Entity;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: 'utilisateur')]
#[ORM\UniqueConstraint(name: 'uq_utilisateur_matricule', columns: ['matricule'])]
#[ORM\UniqueConstraint(name: 'uq_utilisateur_email', columns: ['email'])]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\Column(type: 'string', length: 20)]
    private string $matricule;
    #[ORM\Column(type: 'string', length: 150)]
    private string $email;
    #[ORM\Column(type: 'string', length: 255)]
    private string $motDePasse;
    #[ORM\ManyToOne(targetEntity: Role::class)]
    #[ORM\JoinColumn(name: 'role_id', referencedColumnName: 'id', nullable: false)]
    private Role $role;
    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'actif'])]
    private string $statut = 'actif';
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $doitChangerMotDePasse = false;
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $derniereConnexion = null;
    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    private ?string $resetPasswordTokenHash = null;
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $resetPasswordExpiresAt = null;
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;
    /**
     * Relation 1-1 vers la fiche RH (module Employés). Utilisateur est le côté inverse ;
     * la colonne réelle utilisateur_id vit sur la table employe (voir Employe::$utilisateur).
     */
    #[ORM\OneToOne(targetEntity: Employe::class, mappedBy: 'utilisateur')]
    private ?Employe $employe = null;
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getMatricule(): string
    {
        return $this->matricule;
    }
    public function setMatricule(string $matricule): static
    {
        $this->matricule = $matricule;
        return $this;
    }
    public function getEmail(): string
    {
        return $this->email;
    }
    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }
    public function getRole(): Role
    {
        return $this->role;
    }
    public function setRole(Role $role): static
    {
        $this->role = $role;
        return $this;
    }
    public function getStatut(): string
    {
        return $this->statut;
    }
    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }
    public function isDoitChangerMotDePasse(): bool
    {
        return $this->doitChangerMotDePasse;
    }
    public function setDoitChangerMotDePasse(bool $doitChangerMotDePasse): static
    {
        $this->doitChangerMotDePasse = $doitChangerMotDePasse;
        return $this;
    }
    public function getDerniereConnexion(): ?\DateTimeImmutable
    {
        return $this->derniereConnexion;
    }
    public function setDerniereConnexion(?\DateTimeImmutable $derniereConnexion): static
    {
        $this->derniereConnexion = $derniereConnexion;
        return $this;
    }
    public function getResetPasswordTokenHash(): ?string
    {
        return $this->resetPasswordTokenHash;
    }
    public function setResetPasswordTokenHash(?string $resetPasswordTokenHash): static
    {
        $this->resetPasswordTokenHash = $resetPasswordTokenHash;
        return $this;
    }
    public function getResetPasswordExpiresAt(): ?\DateTimeImmutable
    {
        return $this->resetPasswordExpiresAt;
    }
    public function setResetPasswordExpiresAt(?\DateTimeImmutable $resetPasswordExpiresAt): static
    {
        $this->resetPasswordExpiresAt = $resetPasswordExpiresAt;
        return $this;
    }
    public function clearPasswordReset(): static
    {
        $this->resetPasswordTokenHash = null;
        $this->resetPasswordExpiresAt = null;
        return $this;
    }
    public function getEmploye(): ?Employe
    {
        return $this->employe;
    }
    // --- UserInterface ---
    /**
     * Identifiant utilisé par Symfony Security : le matricule sert de "username".
     */
    public function getUserIdentifier(): string
    {
        return $this->matricule;
    }
    /**
     * @return string[]
     */
    public function getRoles(): array
    {
        $roles = [$this->role->getNom(), 'ROLE_USER'];
        return array_unique($roles);
    }
    public function eraseCredentials(): void
    {
        // Aucune donnée sensible temporaire à effacer ici.
    }
    // --- PasswordAuthenticatedUserInterface ---
    public function getPassword(): string
    {
        return $this->motDePasse;
    }
    public function setPassword(string $motDePasse): static
    {
        $this->motDePasse = $motDePasse;
        return $this;
    }
}
