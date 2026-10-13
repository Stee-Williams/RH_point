<?php

namespace App\Service;
use App\Dto\ChangerMotDePasseRequestDto;
use App\Dto\LoginRequestDto;
use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
class AuthService
{
    public function __construct(
        private readonly UtilisateurRepository $utilisateurRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /**
     * Vérifie les identifiants et retourne l'utilisateur authentifié.
     *
     * @throws AuthenticationException si le matricule est inconnu, le compte inactif,
     *                                 ou le mot de passe incorrect.
     */
    public function authenticate(LoginRequestDto $dto): Utilisateur
    {
        $utilisateur = $this->utilisateurRepository->findByMatricule($dto->matricule);
        if (!$utilisateur) {
            throw new AuthenticationException('Matricule ou mot de passe incorrect.');
        }
        if ($utilisateur->getStatut() !== 'actif') {
            throw new AuthenticationException('Ce compte est désactivé. Contactez le service RH.');
        }
        if (!$this->passwordHasher->isPasswordValid($utilisateur, $dto->motDePasse)) {
            throw new AuthenticationException('Matricule ou mot de passe incorrect.');
        }
        $utilisateur->setDerniereConnexion(new \DateTimeImmutable());
        $this->em->flush();
        return $utilisateur;
    }
    public function generateToken(Utilisateur $utilisateur): string
    {
        return $this->jwtManager->create($utilisateur);
    }
    /**
     * @throws AuthenticationException si l'ancien mot de passe est incorrect.
     */
    public function changerMotDePasse(Utilisateur $utilisateur, ChangerMotDePasseRequestDto $dto): void
    {
        if (!$this->passwordHasher->isPasswordValid($utilisateur, $dto->ancienMotDePasse)) {
            throw new AuthenticationException('Ancien mot de passe incorrect.');
        }
        $utilisateur->setPassword($this->passwordHasher->hashPassword($utilisateur, $dto->nouveauMotDePasse));
        $utilisateur->setDoitChangerMotDePasse(false);
        $this->em->flush();
    }
    /**
     * @return array{id: int|null, matricule: string, email: string, role: string, nom: ?string, prenom: ?string, doitChangerMotDePasse: bool}
     */
    public function buildProfilePayload(Utilisateur $utilisateur): array
    {
        $employe = $utilisateur->getEmploye();
        return [
            'id' => $utilisateur->getId(),
            'matricule' => $utilisateur->getMatricule(),
            'email' => $utilisateur->getEmail(),
            'role' => $utilisateur->getRole()->getNom(),
            'nom' => $employe?->getNom(),
            'prenom' => $employe?->getPrenom(),
            'doitChangerMotDePasse' => $utilisateur->isDoitChangerMotDePasse(),
        ];
    }
}
