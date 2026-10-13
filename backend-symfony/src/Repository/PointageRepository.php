<?php

namespace App\Repository;
use App\Entity\Pointage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;
/**
 * @extends ServiceEntityRepository<Pointage>
 */
class PointageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pointage::class);
    }
    public function findForEmployeAndDate(int $employeId, \DateTimeInterface $date): ?Pointage
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.employe = :employeId')
            ->andWhere('p.datePointage = :date')
            ->setParameter('employeId', $employeId)
            ->setParameter('date', $date->format('Y-m-d'))
            ->getQuery()
            ->getOneOrNullResult();
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
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.employe', 'e')->addSelect('e')
            ->leftJoin('e.service', 's')->addSelect('s');
        if ($employeId !== null) {
            $qb->andWhere('e.id = :employeId')->setParameter('employeId', $employeId);
        }
        if ($serviceId !== null) {
            $qb->andWhere('s.id = :serviceId')->setParameter('serviceId', $serviceId);
        }
        if ($dateDebut !== null && $dateDebut !== '') {
            $qb->andWhere('p.datePointage >= :dateDebut')->setParameter('dateDebut', $dateDebut);
        }
        if ($dateFin !== null && $dateFin !== '') {
            $qb->andWhere('p.datePointage <= :dateFin')->setParameter('dateFin', $dateFin);
        }
        if ($statut !== null && $statut !== '') {
            $qb->andWhere('p.statut = :statut')->setParameter('statut', $statut);
        }
        $qb->orderBy('p.datePointage', 'DESC')
            ->addOrderBy('e.nom', 'ASC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);
        $paginator = new Paginator($qb, fetchJoinCollection: false);
        return [
            'items' => iterator_to_array($paginator),
            'total' => count($paginator),
        ];
    }
}
