<?php

namespace App\Repository;
use App\Entity\Absence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;
/**
 * @extends ServiceEntityRepository<Absence>
 */
class AbsenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Absence::class);
    }
    /**
     * @return array{items: Absence[], total: int}
     */
    public function search(
        ?int $serviceId,
        ?string $dateDebut,
        ?string $dateFin,
        ?string $typeAbsence,
        int $page,
        int $limit
    ): array {
        $qb = $this->createQueryBuilder('a')
            ->leftJoin('a.employe', 'e')->addSelect('e')
            ->leftJoin('e.service', 's')->addSelect('s');
        if ($serviceId !== null) {
            $qb->andWhere('s.id = :serviceId')->setParameter('serviceId', $serviceId);
        }
        if ($dateDebut !== null && $dateDebut !== '') {
            $qb->andWhere('a.dateAbsence >= :dateDebut')->setParameter('dateDebut', $dateDebut);
        }
        if ($dateFin !== null && $dateFin !== '') {
            $qb->andWhere('a.dateAbsence <= :dateFin')->setParameter('dateFin', $dateFin);
        }
        if ($typeAbsence !== null && $typeAbsence !== '') {
            $qb->andWhere('a.typeAbsence = :typeAbsence')->setParameter('typeAbsence', $typeAbsence);
        }
        $qb->orderBy('a.dateAbsence', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);
        $paginator = new Paginator($qb, fetchJoinCollection: false);
        return [
            'items' => iterator_to_array($paginator),
            'total' => count($paginator),
        ];
    }
}
