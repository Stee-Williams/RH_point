<?php

namespace App\Service;
use App\Dto\CongeCreateRequestDto;
use App\Dto\CongeDecisionRequestDto;
use App\Entity\Conge;
use App\Entity\Employe;
use App\Entity\Utilisateur;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Repository\CongeRepository;
use App\Repository\EmployeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
class CongeService
{
    public function __construct(
        private readonly CongeRepository $congeRepository,
        private readonly EmployeRepository $employeRepository,
        private readonly NotificationService $notificationService,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /**
     * @return array{items: Conge[], total: int}
     */
    public function list(?int $employeId, ?int $serviceId, ?string $statut, int $page, int $limit): array
    {
        return $this->congeRepository->search($employeId, $serviceId, $statut, $page, $limit);
    }
    public function find(int $id): Conge
    {
        $conge = $this->congeRepository->find($id);
        if (!$conge) {
            throw new RessourceIntrouvableException('Demande de congé introuvable.');
        }
        return $conge;
    }
    public function create(int $employeId, CongeCreateRequestDto $dto): Conge
    {
        $employe = $this->resolveEmploye($employeId);
        $dateDebut = new \DateTimeImmutable($dto->dateDebut);
        $dateFin = new \DateTimeImmutable($dto->dateFin);
        if ($dateFin < $dateDebut) {
            throw new ConflitMetierException('La date de fin doit être postérieure ou égale à la date de début.');
        }
        if ($this->congeRepository->hasOverlap($employeId, $dateDebut, $dateFin)) {
            throw new ConflitMetierException('Une demande de congé existe déjà sur cette période.');
        }
        $conge = new Conge();
        $conge->setEmploye($employe);
        $conge->setTypeConge($dto->typeConge);
        $conge->setDateDebut($dateDebut);
        $conge->setDateFin($dateFin);
        $conge->setMotif($dto->motif);
        $conge->setJustificatifUrl($dto->justificatifUrl);
        $this->em->persist($conge);
        $this->em->flush();
        $this->notifierChefService($conge);
        return $conge;
    }
    public function approve(
        int $id,
        Utilisateur $validateur,
        CongeDecisionRequestDto $dto,
        ?int $serviceScopeId = null
    ): Conge
    {
        $conge = $this->find($id);
        $this->assertServiceScope($conge, $serviceScopeId);
        $this->assertPending($conge);
        $conge->setStatut('approuvee');
        $conge->setValidePar($validateur);
        $conge->setDateTraitement(new \DateTimeImmutable());
        $conge->setCommentaireValidation($dto->commentaireValidation);
        $this->em->flush();
        $this->notifierEmploye($conge, 'approuvée');
        return $conge;
    }
    public function reject(
        int $id,
        Utilisateur $validateur,
        CongeDecisionRequestDto $dto,
        ?int $serviceScopeId = null
    ): Conge
    {
        $conge = $this->find($id);
        $this->assertServiceScope($conge, $serviceScopeId);
        $this->assertPending($conge);
        $conge->setStatut('refusee');
        $conge->setValidePar($validateur);
        $conge->setDateTraitement(new \DateTimeImmutable());
        $conge->setCommentaireValidation($dto->commentaireValidation);
        $this->em->flush();
        $this->notifierEmploye($conge, 'refusée');
        return $conge;
    }
    /**
     * Notifie le chef du service de l'employé (si un chef est assigné) qu'une nouvelle
     * demande attend sa validation. Sans chef assigné, aucune notification n'est envoyée
     * pour l'instant — le RH peut toujours consulter directement la liste des demandes.
     */
    private function notifierChefService(Conge $conge): void
    {
        $chef = $conge->getEmploye()->getService()?->getChefService();
        if (!$chef) {
            return;
        }
        $this->notificationService->notifier(
            $chef->getUtilisateur(),
            'Nouvelle demande de congé',
            sprintf(
                '%s %s a soumis une demande (%s) du %s au %s.',
                $conge->getEmploye()->getPrenom(),
                $conge->getEmploye()->getNom(),
                $conge->getTypeConge(),
                $conge->getDateDebut()->format('d/m/Y'),
                $conge->getDateFin()->format('d/m/Y')
            ),
            'validation_requise',
            '/validation-conges'
        );
    }
    private function notifierEmploye(Conge $conge, string $decision): void
    {
        $this->notificationService->notifier(
            $conge->getEmploye()->getUtilisateur(),
            'Décision sur votre demande de congé',
            sprintf(
                'Votre demande du %s au %s a été %s.',
                $conge->getDateDebut()->format('d/m/Y'),
                $conge->getDateFin()->format('d/m/Y'),
                $decision
            ),
            'info',
            '/mes-conges'
        );
    }
    private function assertPending(Conge $conge): void
    {
        if ($conge->getStatut() !== 'en_attente') {
            throw new ConflitMetierException('Cette demande a déjà été traitée.');
        }
    }
    private function assertServiceScope(Conge $conge, ?int $serviceScopeId): void
    {
        if (
            $serviceScopeId !== null
            && $conge->getEmploye()->getService()?->getId() !== $serviceScopeId
        ) {
            throw new AccessDeniedException('Cette demande concerne un autre service.');
        }
    }
    private function resolveEmploye(int $employeId): Employe
    {
        $employe = $this->employeRepository->find($employeId);
        if (!$employe) {
            throw new RessourceIntrouvableException('Employé introuvable.');
        }
        return $employe;
    }
}
