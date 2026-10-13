<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class ChangerMotDePasseRequestDto
{
    #[Assert\NotBlank(message: "L'ancien mot de passe est obligatoire.")]
    public string $ancienMotDePasse = '';
    #[Assert\NotBlank(message: 'Le nouveau mot de passe est obligatoire.')]
    #[Assert\Length(min: 8, minMessage: 'Le nouveau mot de passe doit contenir au moins {{ limit }} caractères.')]
    public string $nouveauMotDePasse = '';
}
