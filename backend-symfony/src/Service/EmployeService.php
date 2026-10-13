<?php

namespace App\Service;
use App\Dto\EmployeCreateRequestDto;
use App\Dto\EmployeUpdateRequestDto;
use App\Entity\Employe;
use App\Entity\Horaire;
use App\Entity\Service as ServiceEntity;
use App\Entity\Utilisateur;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Repository\EmployeRepository;
use App\Repository\HoraireRepository;
use App\Repository\RoleRepository;
use App\Repository\ServiceRepository;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
class EmployeService
{
    public function __construct(
        private readonly EmployeRepository $employeRepository,
        private readonly UtilisateurRepository $utilisateurRepository,
        private readonly RoleRepository $roleRepository,
        private readonly ServiceRepository $serviceRepository,
        private readonly HoraireRepository $horaireRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /**
     * @return array{items: Employe[], total: int}
     */
    public function list(?string $q, ?int $serviceId, ?string $statut, int $page, int $limit): array
    {
        return $this->employeRepository->search($q, $serviceId, $statut, $page, $limit);
    }
    public function find(int $id): Employe
    {
        $employe = $this->employeRepository->find($id);
        if (!$employe) {
            throw new RessourceIntrouvableException('Employé introuvable.');
        }
        return $employe;
    }
    /**
     * Crée l'employé ainsi que son compte utilisateur associé (matricule + mot de passe
     * temporaire généré côté serveur). Le mot de passe n'est renvoyé qu'une seule fois,
     * dans la réponse de création, à charge pour le RH de le communiquer à l'employé.
     *
     * @return array{employe: Employe, motDePasseTemporaire: string}
     */
    public function create(EmployeCreateRequestDto $dto): array
    {
        if ($this->utilisateurRepository->findByMatricule($dto->matricule)) {
            throw new ConflitMetierException('Ce matricule est déjà utilisé.');
        }
        if ($this->utilisateurRepository->findByEmail($dto->email)) {
            throw new ConflitMetierException('Cet email est déjà utilisé.');
        }
        $role = $this->roleRepository->findByNom('ROLE_EMPLOYE');
        if (!$role) {
            throw new RessourceIntrouvableException("Le rôle ROLE_EMPLOYE n'existe pas en base. Vérifiez les données de référence.");
        }
        $service = $dto->serviceId !== null ? $this->resolveService($dto->serviceId) : null;
        $horaire = $dto->horaireId !== null ? $this->resolveHoraire($dto->horaireId) : null;
        $motDePasseTemporaire = $this->genererMotDePasseTemporaire();
        $utilisateur = new Utilisateur();
        $utilisateur->setMatricule($dto->matricule);
        $utilisateur->setEmail($dto->email);
        $utilisateur->setRole($role);
        $utilisateur->setPassword($this->passwordHasher->hashPassword($utilisateur, $motDePasseTemporaire));
        $utilisateur->setDoitChangerMotDePasse(true);
        $employe = new Employe();
        $employe->setUtilisateur($utilisateur);
        $employe->setNom($dto->nom);
        $employe->setPrenom($dto->prenom);
        $employe->setTelephone($dto->telephone);
        $employe->setDateNaissance($dto->dateNaissance ? new \DateTimeImmutable($dto->dateNaissance) : null);
        $employe->setDateEmbauche(new \DateTimeImmutable($dto->dateEmbauche));
        $employe->setPoste($dto->poste);
        $employe->setService($service);
        $employe->setHoraire($horaire);
        $this->em->persist($utilisateur);
        $this->em->persist($employe);
        $this->em->flush();
        return ['employe' => $employe, 'motDePasseTemporaire' => $motDePasseTemporaire];
    }
    public function update(int $id, EmployeUpdateRequestDto $dto): Employe
    {
        $employe = $this->find($id);
        $employe->setNom($dto->nom);
        $employe->setPrenom($dto->prenom);
        $employe->setTelephone($dto->telephone);
        $employe->setDateNaissance($dto->dateNaissance ? new \DateTimeImmutable($dto->dateNaissance) : null);
        $employe->setDateEmbauche(new \DateTimeImmutable($dto->dateEmbauche));
        $employe->setPoste($dto->poste);
        $employe->setService($dto->serviceId !== null ? $this->resolveService($dto->serviceId) : null);
        $employe->setHoraire($dto->horaireId !== null ? $this->resolveHoraire($dto->horaireId) : null);
        $employe->setStatut($dto->statut);
        $employe->setUpdatedAt(new \DateTimeImmutable());
        // Le statut du compte de connexion suit celui de la fiche employé
        // (un employé "inactif" ne doit plus pouvoir se connecter).
        $employe->getUtilisateur()->setStatut($dto->statut);
        $this->em->flush();
        return $employe;
    }
    /**
     * Désactive l'employé (soft delete) plutôt que de le supprimer physiquement :
     * l'historique de pointage, congés et absences doit être conservé pour la
     * traçabilité RH/légale. Le compte de connexion associé est désactivé aussi.
     */
    public function deactivate(int $id): void
    {
        $employe = $this->find($id);
        $employe->setStatut('inactif');
        $employe->setUpdatedAt(new \DateTimeImmutable());
        $employe->getUtilisateur()->setStatut('inactif');
        $this->em->flush();
    }
    private function resolveService(int $id): ServiceEntity
    {
        $service = $this->serviceRepository->find($id);
        if (!$service) {
            throw new RessourceIntrouvableException('Service introuvable.');
        }
        return $service;
    }
    private function resolveHoraire(int $id): Horaire
    {
        $horaire = $this->horaireRepository->find($id);
        if (!$horaire) {
            throw new RessourceIntrouvableException('Horaire introuvable.');
        }
        return $horaire;
    }
    private function genererMotDePasseTemporaire(): string
    {
        return bin2hex(random_bytes(6)); // 12 caractères hexadécimaux
    }
}
