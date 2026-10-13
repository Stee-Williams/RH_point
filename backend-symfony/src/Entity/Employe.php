<?php

namespace App\Entity;
use App\Repository\EmployeRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: EmployeRepository::class)]
#[ORM\Table(name: 'employe')]
class Employe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\OneToOne(targetEntity: Utilisateur::class, inversedBy: 'employe')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Utilisateur $utilisateur;
    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Service $service = null;
    #[ORM\ManyToOne(targetEntity: Horaire::class)]
    #[ORM\JoinColumn(name: 'horaire_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Horaire $horaire = null;
    #[ORM\Column(type: 'string', length: 100)]
    private string $nom;
    #[ORM\Column(type: 'string', length: 100)]
    private string $prenom;
    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    private ?string $telephone = null;
    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $dateNaissance = null;
    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateEmbauche;
    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $poste = null;
    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'actif'])]
    private string $statut = 'actif';
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $photoUrl = null;
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getUtilisateur(): Utilisateur
    {
        return $this->utilisateur;
    }
    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }
    public function getService(): ?Service
    {
        return $this->service;
    }
    public function setService(?Service $service): static
    {
        $this->service = $service;
        return $this;
    }
    public function getHoraire(): ?Horaire
    {
        return $this->horaire;
    }
    public function setHoraire(?Horaire $horaire): static
    {
        $this->horaire = $horaire;
        return $this;
    }
    public function getNom(): string
    {
        return $this->nom;
    }
    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }
    public function getPrenom(): string
    {
        return $this->prenom;
    }
    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;
        return $this;
    }
    public function getTelephone(): ?string
    {
        return $this->telephone;
    }
    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;
        return $this;
    }
    public function getDateNaissance(): ?\DateTimeInterface
    {
        return $this->dateNaissance;
    }
    public function setDateNaissance(?\DateTimeInterface $dateNaissance): static
    {
        $this->dateNaissance = $dateNaissance;
        return $this;
    }
    public function getDateEmbauche(): \DateTimeInterface
    {
        return $this->dateEmbauche;
    }
    public function setDateEmbauche(\DateTimeInterface $dateEmbauche): static
    {
        $this->dateEmbauche = $dateEmbauche;
        return $this;
    }
    public function getPoste(): ?string
    {
        return $this->poste;
    }
    public function setPoste(?string $poste): static
    {
        $this->poste = $poste;
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
    public function getPhotoUrl(): ?string
    {
        return $this->photoUrl;
    }
    public function setPhotoUrl(?string $photoUrl): static
    {
        $this->photoUrl = $photoUrl;
        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}
