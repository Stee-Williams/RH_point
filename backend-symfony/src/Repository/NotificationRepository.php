<?php

namespace App\Repository;
use App\Entity\Notification;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;
/**
 * @extends ServiceEntityRepository<Notification>
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }
    /**
     * @return array{items: Notification[], total: int}
     */
    public function search(int $utilisateurId, bool $onlyUnread, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder('n')
            ->andWhere('n.utilisateur = :utilisateurId')
            ->setParameter('utilisateurId', $utilisateurId);
        if ($onlyUnread) {
            $qb->andWhere('n.lu = false');
        }
        $qb->orderBy('n.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);
        $paginator = new Paginator($qb, fetchJoinCollection: false);
        return [
            'items' => iterator_to_array($paginator),
            'total' => count($paginator),
        ];
    }
    public function countUnread(int $utilisateurId): int
    {
        return (int) $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->andWhere('n.utilisateur = :utilisateurId')
            ->andWhere('n.lu = false')
            ->setParameter('utilisateurId', $utilisateurId)
            ->getQuery()
            ->getSingleScalarResult();
    }
    public function markAllAsRead(int $utilisateurId): int
    {
        return $this->createQueryBuilder('n')
            ->update()
            ->set('n.lu', ':lu')
            ->andWhere('n.utilisateur = :utilisateurId')
            ->andWhere('n.lu = false')
            ->setParameter('lu', true)
            ->setParameter('utilisateurId', $utilisateurId)
            ->getQuery()
            ->execute();
    }
}
