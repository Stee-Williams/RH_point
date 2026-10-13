<?php

namespace App\Service;
use App\Dto\PointageActionRequestDto;
use App\Entity\Employe;
use App\Entity\Pointage;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Repository\EmployeRepository;
use App\Repository\PointageRepository;
use Doctrine\ORM\EntityManagerInterface;
class PointageService
{
    public function __construct(
        private readonly PointageRepository $pointageRepository,
        private readonly EmployeRepository $employeRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }
    public function clockIn(int $employeId, PointageActionRequestDto $dto): Pointage
    {
        $employe = $this->resolveEmploye($employeId);
        $today = new \DateTimeImmutable('today');
        $existing = $this->pointageRepository->findForEmployeAndDate($employeId, $today);
        if ($existing && $existing->getHeureArrivee() !== null) {
            throw new ConflitMetierException("Arrivée déjà enregistrée aujourd'hui.");
        }
        $pointage = $existing ?? new Pointage();
        if (!$existing) {
            $pointage->setEmploye($employe);
            $pointage->setDatePointage($today);
            $this->em->persist($pointage);
        }
        $pointage->setHeureArrivee(new \DateTimeImmutable());
        $pointage->setMethode($dto->methode);
        $pointage->setLatitude($dto->latitude !== null ? (string) $dto->latitude : null);
        $pointage->setLongitude($dto->longitude !== null ? (string) $dto->longitude : null);
        $this->em->flush();
        // Récupère retard_minutes/statut calculés par le trigger PostgreSQL fn_calculer_pointage.
        $this->em->refresh($pointage);
        return $pointage;
    }
    public function clockOut(int $employeId, PointageActionRequestDto $dto): Pointage
    {
        $today = new \DateTimeImmutable('today');
        $pointage = $this->pointageRepository->findForEmployeAndDate($employeId, $today);
        if (!$pointage || $pointage->getHeureArrivee() === null) {
            throw new ConflitMetierException("Vous devez d'abord pointer votre arrivée.");
        }
        if ($pointage->getHeureDepart() !== null) {
            throw new ConflitMetierException("Départ déjà enregistré aujourd'hui.");
        }
        $pointage->setHeureDepart(new \DateTimeImmutable());
        $pointage->setMethode($dto->methode);
        if ($dto->latitude !== null) {
            $pointage->setLatitude((string) $dto->latitude);
        }
        if ($dto->longitude !== null) {
            $pointage->setLongitude((string) $dto->longitude);
        }
        $this->em->flush();
        $this->em->refresh($pointage);
        return $pointage;
    }
    public function todayFor(int $employeId): ?Pointage
    {
        return $this->pointageRepository->findForEmployeAndDate($employeId, new \DateTimeImmutable('today'));
    }
    /**
     * @return array{items: Pointage[], total: int}
     */
    public function search(
        ?int $employeId,
        ?int $serviceId,
        ?string $dateDebut,
        ?string $dateFin,
        ?string $statut,
        int $page,
        int $limit
    ): array {
        return $this->pointageRepository->search($employeId, $serviceId, $dateDebut, $dateFin, $statut, $page, $limit);
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
