<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class HoraireCreateRequestDto
{
    #[Assert\NotBlank(message: "Le nom de l'horaire est obligatoire.")]
    #[Assert\Length(max: 100)]
    public string $nom = '';
    /** Format 'HH:MM' */
    #[Assert\NotBlank(message: "L'heure de début est obligatoire.")]
    public string $heureDebut = '';
    /** Format 'HH:MM' */
    #[Assert\NotBlank(message: "L'heure de fin est obligatoire.")]
    public string $heureFin = '';
    /** @var int[]|null Jours travaillés (1 = lundi ... 7 = dimanche) */
    public ?array $joursTravailles = null;
    #[Assert\PositiveOrZero]
    public ?int $dureePauseMinutes = null;
    #[Assert\PositiveOrZero]
    public ?int $toleranceRetardMinutes = null;
}
