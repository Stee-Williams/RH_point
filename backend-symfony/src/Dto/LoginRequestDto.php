<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class LoginRequestDto
{
    #[Assert\NotBlank(message: 'Le matricule est obligatoire.')]
    public string $matricule = '';
    #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.')]
    public string $motDePasse = '';
}
