<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class DemandeReinitialisationMotDePasseRequestDto
{
    #[Assert\NotBlank(message: 'L’adresse e-mail est obligatoire.')]
    #[Assert\Email(message: 'Saisissez une adresse e-mail valide.')]
    #[Assert\Length(max: 150)]
    public string $email = '';
}
