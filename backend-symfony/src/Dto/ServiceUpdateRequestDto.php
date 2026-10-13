<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class ServiceUpdateRequestDto
{
    #[Assert\NotBlank(message: 'Le nom du service est obligatoire.')]
    #[Assert\Length(max: 100)]
    public string $nom = '';
    public ?string $description = null;
    public ?int $chefServiceId = null;
}
