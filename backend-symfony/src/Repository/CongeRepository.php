<?php

namespace App\Repository;
use App\Entity\Conge;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;
/**
 * @extends ServiceEntityRepository<Conge>
 */
class CongeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conge::class);
    }
    /**
     * Vérifie si une demande de congé (non refusée) chevauche déjà la période donnée
     * pour cet employé, afin d'éviter les doubles demandes sur les mêmes jours.
     */
    public function hasOverlap(int $employeId, \DateTimeInterface $dateDebut, \DateTimeInterface $dateFin): bool
    {
        $count = $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.employe = :employeId')
            ->andWhere('c.statut != :refusee')
            ->andWhere('c.dateDebut <= :dateFin')
            ->andWhere('c.dateFin >= :dateDebut')
            ->setParameter('employeId', $employeId)
            ->setParameter('refusee', 'refusee')
            ->setParameter('dateDebut', $dateDebut->format('Y-m-d'))
            ->setParameter('dateFin', $dateFin->format('Y-m-d'))
            ->getQuery()
            ->getSingleScalarResult();
        return ((int) $count) > 0;
    }
    /**
     * @return array{items: Conge[], total: int}
     */
    public function search(?int $employeId, ?int $serviceId, ?string $statut, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.employe', 'e')->addSelect('e')
            ->leftJoin('e.service', 's')->addSelect('s');
        if ($employeId !== null) {
            $qb->andWhere('e.id = :employeId')->setParameter('employeId', $employeId);
        }
        if ($serviceId !== null) {
            $qb->andWhere('s.id = :serviceId')->setParameter('serviceId', $serviceId);
        }
        if ($statut !== null && $statut !== '') {
            $qb->andWhere('c.statut = :statut')->setParameter('statut', $statut);
        }
        $qb->orderBy('c.dateDemande', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);
        $paginator = new Paginator($qb, fetchJoinCollection: false);
        return [
            'items' => iterator_to_array($paginator),
            'total' => count($paginator),
        ];
    }
}
