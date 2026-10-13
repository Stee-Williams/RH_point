<?php

namespace App\Controller\Api;
use App\Entity\Notification;
use App\Entity\Utilisateur;
use App\Exception\RessourceIntrouvableException;
use App\Service\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $utilisateurId = $this->currentUtilisateurId();
        if ($utilisateurId === null) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        $onlyUnread = $request->query->getBoolean('onlyUnread', false);
        $result = $this->notificationService->list($utilisateurId, $onlyUnread, $page, $limit);
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Notification $n) => $this->toArray($n), $result['items']),
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($result['total'] / max(1, $limit)),
            ],
        ]);
    }
    #[Route('/non-lues', name: 'api_notifications_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        $utilisateurId = $this->currentUtilisateurId();
        if ($utilisateurId === null) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'success' => true,
            'data' => ['count' => $this->notificationService->countUnread($utilisateurId)],
        ]);
    }
    #[Route('/{id}/lu', name: 'api_notifications_mark_read', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function markAsRead(int $id): JsonResponse
    {
        $utilisateurId = $this->currentUtilisateurId();
        if ($utilisateurId === null) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        try {
            $notification = $this->notificationService->markAsRead($id, $utilisateurId);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'data' => $this->toArray($notification)]);
    }
    #[Route('/lu-toutes', name: 'api_notifications_mark_all_read', methods: ['PUT'])]
    public function markAllAsRead(): JsonResponse
    {
        $utilisateurId = $this->currentUtilisateurId();
        if ($utilisateurId === null) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        $count = $this->notificationService->markAllAsRead($utilisateurId);
        return $this->json(['success' => true, 'message' => sprintf('%d notification(s) marquée(s) comme lues.', $count)]);
    }
    private function currentUtilisateurId(): ?int
    {
        $utilisateur = $this->getUser();
        return $utilisateur instanceof Utilisateur ? $utilisateur->getId() : null;
    }
    /** @return array<string, mixed> */
    private function toArray(Notification $notification): array
    {
        return [
            'id' => $notification->getId(),
            'titre' => $notification->getTitre(),
            'message' => $notification->getMessage(),
            'type' => $notification->getType(),
            'lu' => $notification->isLu(),
            'lien' => $notification->getLien(),
            'createdAt' => $notification->getCreatedAt()->format('Y-m-d H:i'),
        ];
    }
}
