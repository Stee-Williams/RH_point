<?php

namespace App\Entity;
use App\Repository\AbsenceRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: AbsenceRepository::class)]
#[ORM\Table(name: 'absence')]
#[ORM\UniqueConstraint(name: 'uq_absence_employe_jour', columns: ['employe_id', 'date_absence'])]
class Absence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Employe::class)]
    #[ORM\JoinColumn(name: 'employe_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Employe $employe;
    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $dateAbsence;
    #[ORM\Column(type: 'string', length: 20)]
    private string $typeAbsence;
    #[ORM\ManyToOne(targetEntity: Conge::class)]
    #[ORM\JoinColumn(name: 'conge_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Conge $conge = null;
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
    public function getDateAbsence(): \DateTimeInterface
    {
        return $this->dateAbsence;
    }
    public function setDateAbsence(\DateTimeInterface $dateAbsence): static
    {
        $this->dateAbsence = $dateAbsence;
        return $this;
    }
    public function getTypeAbsence(): string
    {
        return $this->typeAbsence;
    }
    public function setTypeAbsence(string $typeAbsence): static
    {
        $this->typeAbsence = $typeAbsence;
        return $this;
    }
    public function getConge(): ?Conge
    {
        return $this->conge;
    }
    public function setConge(?Conge $conge): static
    {
        $this->conge = $conge;
        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
