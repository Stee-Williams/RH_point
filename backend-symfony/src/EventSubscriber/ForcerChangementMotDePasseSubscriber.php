<?php

namespace App\EventSubscriber;
use App\Entity\Utilisateur;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
/**
 * Bloque l'accès à l'API (hors connexion/déconnexion/profil/changement de mot de passe)
 * tant que l'utilisateur n'a pas changé son mot de passe temporaire initial.
 *
 * Priorité 7 : s'exécute juste après le listener de sécurité du firewall (priorité 8),
 * pour que $security->getUser() soit déjà résolu à partir du JWT.
 */
class ForcerChangementMotDePasseSubscriber implements EventSubscriberInterface
{
    private const ROUTES_AUTORISEES = [
        'api_auth_login',
        'api_auth_logout',
        'api_auth_refresh',
        'api_auth_me',
        'api_auth_changer_mot_de_passe',
    ];
    public function __construct(private readonly Security $security)
    {
    }
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 7]];
    }
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        $request = $event->getRequest();
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }
        if (in_array($request->attributes->get('_route'), self::ROUTES_AUTORISEES, true)) {
            return;
        }
        $utilisateur = $this->security->getUser();
        if ($utilisateur instanceof Utilisateur && $utilisateur->isDoitChangerMotDePasse()) {
            $event->setResponse(new JsonResponse([
                'success' => false,
                'message' => 'Vous devez changer votre mot de passe temporaire avant de continuer.',
                'code' => 'MOT_DE_PASSE_A_CHANGER',
            ], Response::HTTP_FORBIDDEN));
        }
    }
}
