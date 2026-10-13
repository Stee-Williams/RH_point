<?php

namespace App\Entity;
use App\Repository\CongeRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: CongeRepository::class)]
#[ORM\Table(name: 'conge')]
class Conge
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Employe::class)]
    #[ORM\JoinColumn(name: 'employe_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Employe $employe;
    #[ORM\Column(type: 'string', length: 30)]
    private string $typeConge;
    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateDebut;
    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateFin;
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $motif = null;
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $justificatifUrl = null;
    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'en_attente'])]
    private string $statut = 'en_attente';
    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'valide_par_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Utilisateur $validePar = null;
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $dateDemande;
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateTraitement = null;
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commentaireValidation = null;
    public function __construct()
    {
        $this->dateDemande = new \DateTimeImmutable();
    }
    public function getId(): ?int
    {
        return $this->id;
    }
    public function getEmploye(): Employe
    {
        return $this->employe;
    }
    public function setEmploye(Employe $employe): static
    {
        $this->employe = $employe;
        return $this;
    }
    public function getTypeConge(): string
    {
        return $this->typeConge;
    }
    public function setTypeConge(string $typeConge): static
    {
        $this->typeConge = $typeConge;
        return $this;
    }
    public function getDateDebut(): \DateTimeInterface
    {
        return $this->dateDebut;
    }
    public function setDateDebut(\DateTimeInterface $dateDebut): static
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }
    public function getDateFin(): \DateTimeInterface
    {
        return $this->dateFin;
    }
    public function setDateFin(\DateTimeInterface $dateFin): static
    {
        $this->dateFin = $dateFin;
        return $this;
    }
    public function getMotif(): ?string
    {
        return $this->motif;
    }
    public function setMotif(?string $motif): static
    {
        $this->motif = $motif;
        return $this;
    }
    public function getJustificatifUrl(): ?string
    {
        return $this->justificatifUrl;
    }
    public function setJustificatifUrl(?string $justificatifUrl): static
    {
        $this->justificatifUrl = $justificatifUrl;
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
    public function getValidePar(): ?Utilisateur
    {
        return $this->validePar;
    }
    public function setValidePar(?Utilisateur $validePar): static
    {
        $this->validePar = $validePar;
        return $this;
    }
    public function getDateDemande(): \DateTimeImmutable
    {
        return $this->dateDemande;
    }
    public function getDateTraitement(): ?\DateTimeImmutable
    {
        return $this->dateTraitement;
    }
    public function setDateTraitement(?\DateTimeImmutable $dateTraitement): static
    {
        $this->dateTraitement = $dateTraitement;
        return $this;
    }
    public function getCommentaireValidation(): ?string
    {
        return $this->commentaireValidation;
    }
    public function setCommentaireValidation(?string $commentaireValidation): static
    {
        $this->commentaireValidation = $commentaireValidation;
        return $this;
    }
}
