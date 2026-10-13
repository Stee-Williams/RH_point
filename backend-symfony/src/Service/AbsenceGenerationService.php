<?php

namespace App\Service;
use App\Entity\Absence;
use App\Entity\Conge;
use App\Repository\CongeRepository;
use App\Repository\EmployeRepository;
use App\Repository\PointageRepository;
use Doctrine\ORM\EntityManagerInterface;
/**
 * Génère automatiquement les constats d'absence pour une date donnée, en comparant
 * pour chaque employé actif : présence d'un pointage ce jour-là, jour travaillé selon
 * son horaire, et couverture éventuelle par un congé déjà approuvé.
 *
 * Destiné à être exécuté quotidiennement (une fois la journée terminée, ex. le lendemain
 * matin) via la commande `app:absences:generate`, à planifier en cron. Rejouable sans
 * risque de doublon (vérifie l'existence d'un constat avant d'en créer un nouveau).
 */
class AbsenceGenerationService
{
    public function __construct(
        private readonly EmployeRepository $employeRepository,
        private readonly PointageRepository $pointageRepository,
        private readonly CongeRepository $congeRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /**
     * @return array{creees: int, ignorees: int}
     */
    public function generatePourDate(\DateTimeInterface $date): array
    {
        $jourSemaine = (int) $date->format('N'); // 1 = lundi ... 7 = dimanche
        $employes = $this->employeRepository->findBy(['statut' => 'actif']);
        $creees = 0;
        $ignorees = 0;
        foreach ($employes as $employe) {
            $horaire = $employe->getHoraire();
            // Pas d'horaire assigné, ou jour non travaillé pour cet employé : rien à constater.
            if (!$horaire || !in_array($jourSemaine, $horaire->getJoursTravailles(), true)) {
                $ignorees++;
                continue;
            }
            // Déjà un pointage ce jour-là : l'employé était présent (ou en retard), pas absent.
            if ($this->pointageRepository->findForEmployeAndDate($employe->getId(), $date)) {
                $ignorees++;
                continue;
            }
            // Constat déjà généré pour ce jour : ne pas dupliquer.
            $existeDeja = $this->em->getRepository(Absence::class)->findOneBy([
                'employe' => $employe,
                'dateAbsence' => $date,
            ]);
            if ($existeDeja) {
                $ignorees++;
                continue;
            }
            $congeApprouve = $this->congeApprouveCouvrant($employe->getId(), $date);
            $absence = new Absence();
            $absence->setEmploye($employe);
            $absence->setDateAbsence($date);
            $absence->setTypeAbsence($congeApprouve ? 'justifiee' : 'non_justifiee');
            $absence->setConge($congeApprouve);
            $this->em->persist($absence);
            $creees++;
        }
        $this->em->flush();
        return ['creees' => $creees, 'ignorees' => $ignorees];
    }
    private function congeApprouveCouvrant(int $employeId, \DateTimeInterface $date): ?Conge
    {
        return $this->em->createQueryBuilder()
            ->select('c')
            ->from(Conge::class, 'c')
            ->andWhere('c.employe = :employeId')
            ->andWhere('c.statut = :approuvee')
            ->andWhere('c.dateDebut <= :date')
            ->andWhere('c.dateFin >= :date')
            ->setParameter('employeId', $employeId)
            ->setParameter('approuvee', 'approuvee')
            ->setParameter('date', $date->format('Y-m-d'))
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
