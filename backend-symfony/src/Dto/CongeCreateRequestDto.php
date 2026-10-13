<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class CongeCreateRequestDto
{
    #[Assert\NotBlank(message: 'Le type de demande est obligatoire.')]
    #[Assert\Choice(
        choices: ['conge_annuel', 'permission', 'absence_justifiee'],
        message: 'Type de demande invalide.'
    )]
    public string $typeConge = '';
    /** Format 'YYYY-MM-DD' */
    #[Assert\NotBlank(message: 'La date de début est obligatoire.')]
    #[Assert\Date(message: 'La date de début doit être au format YYYY-MM-DD.')]
    public string $dateDebut = '';
    /** Format 'YYYY-MM-DD' */
    #[Assert\NotBlank(message: 'La date de fin est obligatoire.')]
    #[Assert\Date(message: 'La date de fin doit être au format YYYY-MM-DD.')]
    public string $dateFin = '';
    public ?string $motif = null;
    public ?string $justificatifUrl = null;
}
