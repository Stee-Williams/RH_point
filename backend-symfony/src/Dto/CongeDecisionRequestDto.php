<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class CongeDecisionRequestDto
{
    #[Assert\Length(max: 1000)]
    public ?string $commentaireValidation = null;
}
