<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class PointageActionRequestDto
{
    #[Assert\Choice(choices: ['bouton', 'qr_code', 'badge_rfid', 'biometrique'], message: 'Méthode de pointage invalide.')]
    public string $methode = 'bouton';
    public ?float $latitude = null;
    public ?float $longitude = null;
}
