<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class ReinitialiserMotDePasseRequestDto
{
    #[Assert\NotBlank(message: 'Le lien de réinitialisation est invalide.')]
    #[Assert\Regex(pattern: '/^[a-f0-9]{64}$/D', message: 'Le lien de réinitialisation est invalide.')]
    public string $token = '';

    #[Assert\NotBlank(message: 'Le nouveau mot de passe est obligatoire.')]
    #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.')]
    public string $nouveauMotDePasse = '';
}
