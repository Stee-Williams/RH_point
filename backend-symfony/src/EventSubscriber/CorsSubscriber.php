<?php

namespace App\EventSubscriber;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
/**
 * Gère les en-têtes CORS pour autoriser le frontend React (port 5173)
 * à communiquer avec l'API Symfony (port 8000).
 */
class CorsSubscriber implements EventSubscriberInterface
{
    /** Origines autorisées (frontend dev + production). */
    private const ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ];
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST  => ['onKernelRequest', 9999],
            KernelEvents::RESPONSE => ['onKernelResponse', 9999],
        ];
    }
    /**
     * Répondre immédiatement aux requêtes OPTIONS (preflight CORS).
     */
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if ('OPTIONS' !== $request->getMethod()) {
            return;
        }
        $origin = $request->headers->get('Origin', '');
        if (!in_array($origin, self::ALLOWED_ORIGINS, true)) {
            return;
        }
        $response = new Response('', Response::HTTP_NO_CONTENT);
        $this->addCorsHeaders($response, $origin);
        $event->setResponse($response);
    }
    /**
     * Ajouter les en-têtes CORS à toutes les réponses /api.
     */
    public function onKernelResponse(ResponseEvent $event): void
    {
        $request = $event->getRequest();
        $origin  = $request->headers->get('Origin', '');
        if (!in_array($origin, self::ALLOWED_ORIGINS, true)) {
            return;
        }
        // Ne s'applique qu'aux routes /api
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }
        $this->addCorsHeaders($event->getResponse(), $origin);
    }
    private function addCorsHeaders(Response $response, string $origin): void
    {
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Max-Age', '3600');
    }
}
