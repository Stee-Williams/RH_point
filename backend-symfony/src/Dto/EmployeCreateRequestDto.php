<?php

namespace App\Dto;
use Symfony\Component\Validator\Constraints as Assert;
final class EmployeCreateRequestDto
{
    #[Assert\NotBlank(message: 'Le matricule est obligatoire.')]
    #[Assert\Length(max: 20)]
    public string $matricule = '';
    #[Assert\NotBlank(message: "L'email est obligatoire.")]
    #[Assert\Email(message: "L'email n'est pas valide.")]
    public string $email = '';
    #[Assert\NotBlank(message: 'Le nom est obligatoire.')]
    #[Assert\Length(max: 100)]
    public string $nom = '';
    #[Assert\NotBlank(message: 'Le prénom est obligatoire.')]
    #[Assert\Length(max: 100)]
    public string $prenom = '';
    #[Assert\Length(max: 20)]
    public ?string $telephone = null;
    /** Format attendu : 'YYYY-MM-DD' */
    #[Assert\Date(message: 'La date de naissance doit être au format YYYY-MM-DD.')]
    public ?string $dateNaissance = null;
    /** Format attendu : 'YYYY-MM-DD' */
    #[Assert\NotBlank(message: "La date d'embauche est obligatoire.")]
    #[Assert\Date(message: "La date d'embauche doit être au format YYYY-MM-DD.")]
    public string $dateEmbauche = '';
    #[Assert\Length(max: 100)]
    public ?string $poste = null;
    public ?int $serviceId = null;
    public ?int $horaireId = null;
}
