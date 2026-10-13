<?php

namespace App\Entity;
use App\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'notification')]
class Notification
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;
    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Utilisateur $utilisateur;
    #[ORM\Column(type: 'string', length: 150)]
    private string $titre;
    #[ORM\Column(type: 'text')]
    private string $message;
    #[ORM\Column(type: 'string', length: 30, options: ['default' => 'info'])]
    private string $type = 'info';
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $lu = false;
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $lien = null;
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
    public function getUtilisateur(): Utilisateur
    {
        return $this->utilisateur;
    }
    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }
    public function getTitre(): string
    {
        return $this->titre;
    }
    public function setTitre(string $titre): static
    {
        $this->titre = $titre;
        return $this;
    }
    public function getMessage(): string
    {
        return $this->message;
    }
    public function setMessage(string $message): static
    {
        $this->message = $message;
        return $this;
    }
    public function getType(): string
    {
        return $this->type;
    }
    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }
    public function isLu(): bool
    {
        return $this->lu;
    }
    public function setLu(bool $lu): static
    {
        $this->lu = $lu;
        return $this;
    }
    public function getLien(): ?string
    {
        return $this->lien;
    }
    public function setLien(?string $lien): static
    {
        $this->lien = $lien;
        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
