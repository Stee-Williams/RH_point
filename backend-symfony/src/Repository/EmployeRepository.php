<?php

namespace App\Repository;
use App\Entity\Employe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;
/**
 * @extends ServiceEntityRepository<Employe>
 */
class EmployeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Employe::class);
    }
    /**
     * Recherche paginée avec filtres optionnels (texte libre sur nom/prénom/matricule,
     * service, statut).
     *
     * @return array{items: Employe[], total: int}
     */
    public function search(?string $q, ?int $serviceId, ?string $statut, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder('e')
            ->leftJoin('e.service', 's')->addSelect('s')
            ->leftJoin('e.horaire', 'h')->addSelect('h')
            ->leftJoin('e.utilisateur', 'u')->addSelect('u');
        if ($q !== null && trim($q) !== '') {
            $qb->andWhere('LOWER(e.nom) LIKE :q OR LOWER(e.prenom) LIKE :q OR LOWER(u.matricule) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower(trim($q)).'%');
        }
        if ($serviceId !== null) {
            $qb->andWhere('s.id = :serviceId')->setParameter('serviceId', $serviceId);
        }
        if ($statut !== null && $statut !== '') {
            $qb->andWhere('e.statut = :statut')->setParameter('statut', $statut);
        }
        $qb->orderBy('e.nom', 'ASC')
            ->addOrderBy('e.prenom', 'ASC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);
        $paginator = new Paginator($qb, fetchJoinCollection: false);
        return [
            'items' => iterator_to_array($paginator),
            'total' => count($paginator),
        ];
    }
}
