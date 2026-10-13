<?php

namespace App\Service;
use App\Entity\Notification;
use App\Entity\Utilisateur;
use App\Exception\RessourceIntrouvableException;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
class NotificationService
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /**
     * Création bas niveau, utilisée par les autres services métier (ex. CongeService)
     * pour notifier un utilisateur d'un événement (nouvelle demande, décision...).
     */
    public function notifier(
        Utilisateur $utilisateur,
        string $titre,
        string $message,
        string $type = 'info',
        ?string $lien = null
    ): Notification {
        $notification = new Notification();
        $notification->setUtilisateur($utilisateur);
        $notification->setTitre($titre);
        $notification->setMessage($message);
        $notification->setType($type);
        $notification->setLien($lien);
        $this->em->persist($notification);
        $this->em->flush();
        return $notification;
    }
    /**
     * @return array{items: Notification[], total: int}
     */
    public function list(int $utilisateurId, bool $onlyUnread, int $page, int $limit): array
    {
        return $this->notificationRepository->search($utilisateurId, $onlyUnread, $page, $limit);
    }
    public function countUnread(int $utilisateurId): int
    {
        return $this->notificationRepository->countUnread($utilisateurId);
    }
    public function markAsRead(int $id, int $utilisateurId): Notification
    {
        $notification = $this->notificationRepository->find($id);
        // Un utilisateur ne peut marquer comme lue qu'une notification qui lui appartient.
        if (!$notification || $notification->getUtilisateur()->getId() !== $utilisateurId) {
            throw new RessourceIntrouvableException('Notification introuvable.');
        }
        $notification->setLu(true);
        $this->em->flush();
        return $notification;
    }
    public function markAllAsRead(int $utilisateurId): int
    {
        return $this->notificationRepository->markAllAsRead($utilisateurId);
    }
}
