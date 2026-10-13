<?php

namespace App\Entity;
use App\Repository\HoraireRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: HoraireRepository::class)]
#[ORM\Table(name: 'horaire')]
class Horaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\Column(type: 'string', length: 100)]
    private string $nom;
    #[ORM\Column(type: 'time')]
    private \DateTimeInterface $heureDebut;
    #[ORM\Column(type: 'time')]
    private \DateTimeInterface $heureFin;
    /** @var int[] Jours travaillés (1 = lundi ... 7 = dimanche) */
    #[ORM\Column(type: 'smallint_array')]
    private array $joursTravailles = [1, 2, 3, 4, 5];
    #[ORM\Column(type: 'smallint', options: ['default' => 60])]
    private int $dureePauseMinutes = 60;
    #[ORM\Column(type: 'smallint', options: ['default' => 10])]
    private int $toleranceRetardMinutes = 10;
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
    public function getNom(): string
    {
        return $this->nom;
    }
    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }
    public function getHeureDebut(): \DateTimeInterface
    {
        return $this->heureDebut;
    }
    public function setHeureDebut(\DateTimeInterface $heureDebut): static
    {
        $this->heureDebut = $heureDebut;
        return $this;
    }
    public function getHeureFin(): \DateTimeInterface
    {
        return $this->heureFin;
    }
    public function setHeureFin(\DateTimeInterface $heureFin): static
    {
        $this->heureFin = $heureFin;
        return $this;
    }
    /** @return int[] */
    public function getJoursTravailles(): array
    {
        return $this->joursTravailles;
    }
    /** @param int[] $joursTravailles */
    public function setJoursTravailles(array $joursTravailles): static
    {
        $this->joursTravailles = $joursTravailles;
        return $this;
    }
    public function getDureePauseMinutes(): int
    {
        return $this->dureePauseMinutes;
    }
    public function setDureePauseMinutes(int $dureePauseMinutes): static
    {
        $this->dureePauseMinutes = $dureePauseMinutes;
        return $this;
    }
    public function getToleranceRetardMinutes(): int
    {
        return $this->toleranceRetardMinutes;
    }
    public function setToleranceRetardMinutes(int $toleranceRetardMinutes): static
    {
        $this->toleranceRetardMinutes = $toleranceRetardMinutes;
        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
