<?php

namespace App\Entity;
use App\Repository\PointageRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: PointageRepository::class)]
#[ORM\Table(name: 'pointage')]
#[ORM\UniqueConstraint(name: 'uq_pointage_employe_jour', columns: ['employe_id', 'date_pointage'])]
class Pointage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Employe::class)]
    #[ORM\JoinColumn(name: 'employe_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Employe $employe;
    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $datePointage;
    #[ORM\Column(type: 'time', nullable: true)]
    private ?\DateTimeInterface $heureArrivee = null;
    #[ORM\Column(type: 'time', nullable: true)]
    private ?\DateTimeInterface $heureDepart = null;
    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'bouton'])]
    private string $methode = 'bouton';
    /** Stocké en chaîne par Doctrine (type decimal) pour éviter les pertes de précision flottante. */
    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?string $latitude = null;
    #[ORM\Column(type: 'decimal', precision: 10, scale: 7, nullable: true)]
    private ?string $longitude = null;
    /** Calculé par le trigger PostgreSQL fn_calculer_pointage — ne pas définir manuellement en PHP. */
    #[ORM\Column(type: 'smallint', options: ['default' => 0])]
    private int $retardMinutes = 0;
    /** Calculé par le trigger PostgreSQL fn_calculer_pointage — ne pas définir manuellement en PHP. */
    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $heuresSupplementairesMinutes = 0;
    /** Calculé par le trigger PostgreSQL fn_calculer_pointage — ne pas définir manuellement en PHP. */
    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'present'])]
    private string $statut = 'present';
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
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
    public function getDatePointage(): \DateTimeInterface
    {
        return $this->datePointage;
    }
    public function setDatePointage(\DateTimeInterface $datePointage): static
    {
        $this->datePointage = $datePointage;
        return $this;
    }
    public function getHeureArrivee(): ?\DateTimeInterface
    {
        return $this->heureArrivee;
    }
    public function setHeureArrivee(?\DateTimeInterface $heureArrivee): static
    {
        $this->heureArrivee = $heureArrivee;
        return $this;
    }
    public function getHeureDepart(): ?\DateTimeInterface
    {
        return $this->heureDepart;
    }
    public function setHeureDepart(?\DateTimeInterface $heureDepart): static
    {
        $this->heureDepart = $heureDepart;
        return $this;
    }
    public function getMethode(): string
    {
        return $this->methode;
    }
    public function setMethode(string $methode): static
    {
        $this->methode = $methode;
        return $this;
    }
    public function getLatitude(): ?string
    {
        return $this->latitude;
    }
    public function setLatitude(?string $latitude): static
    {
        $this->latitude = $latitude;
        return $this;
    }
    public function getLongitude(): ?string
    {
        return $this->longitude;
    }
    public function setLongitude(?string $longitude): static
    {
        $this->longitude = $longitude;
        return $this;
    }
    public function getRetardMinutes(): int
    {
        return $this->retardMinutes;
    }
    public function getHeuresSupplementairesMinutes(): int
    {
        return $this->heuresSupplementairesMinutes;
    }
    public function getStatut(): string
    {
        return $this->statut;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
