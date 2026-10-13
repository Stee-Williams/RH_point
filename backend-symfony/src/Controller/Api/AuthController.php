<?php

namespace App\Controller\Api;
use App\Dto\ChangerMotDePasseRequestDto;
use App\Dto\DemandeReinitialisationMotDePasseRequestDto;
use App\Dto\LoginRequestDto;
use App\Dto\ReinitialiserMotDePasseRequestDto;
use App\Entity\Utilisateur;
use App\Service\AuthService;
use App\Service\PasswordResetService;
use App\Service\PasswordResetUnavailableException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Psr\Log\LoggerInterface;
#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly PasswordResetService $passwordResetService,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
        #[Autowire(service: 'limiter.password_reset')]
        private readonly RateLimiterFactory $passwordResetLimiter,
        private readonly LoggerInterface $logger,
    ) {
    }
    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        /** @var LoginRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), LoginRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $utilisateur = $this->authService->authenticate($dto);
        } catch (AuthenticationException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'token' => $this->authService->generateToken($utilisateur),
                'user' => $this->authService->buildProfilePayload($utilisateur),
            ],
        ]);
    }
    #[Route('/mot-de-passe-oublie', name: 'api_auth_password_reset_request', methods: ['POST'])]
    public function demanderReinitialisationMotDePasse(Request $request): JsonResponse
    {
        $limit = $this->passwordResetLimiter
            ->create($request->getClientIp() ?? 'unknown')
            ->consume();
        if (!$limit->isAccepted()) {
            $retryAfter = max(1, $limit->getRetryAfter()->getTimestamp() - time());
            return $this->json(
                ['success' => false, 'message' => 'Trop de demandes. Réessayez dans quelques minutes.'],
                Response::HTTP_TOO_MANY_REQUESTS,
                ['Retry-After' => (string) $retryAfter]
            );
        }

        /** @var DemandeReinitialisationMotDePasseRequestDto $dto */
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            DemandeReinitialisationMotDePasseRequestDto::class,
            'json'
        );
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $this->passwordResetService->sendResetLink($dto->email);
        } catch (PasswordResetUnavailableException) {
            $this->logger->error('Le transport e-mail de réinitialisation est désactivé.');
            return $this->json([
                'success' => false,
                'message' => 'La réinitialisation par e-mail n’est pas configurée. Contactez votre service RH.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        } catch (TransportExceptionInterface $exception) {
            $this->logger->error('Échec de l’envoi d’un e-mail de réinitialisation.', [
                'exception' => $exception::class,
            ]);
            return $this->json([
                'success' => false,
                'message' => 'L’envoi du message a échoué. Réessayez plus tard ou contactez votre service RH.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->json([
            'success' => true,
            'message' => 'Si cette adresse correspond à un compte actif, un lien de réinitialisation lui a été envoyé.',
            'data' => null,
        ]);
    }
    #[Route('/reinitialiser-mot-de-passe', name: 'api_auth_password_reset_confirm', methods: ['POST'])]
    public function reinitialiserMotDePasse(Request $request): JsonResponse
    {
        /** @var ReinitialiserMotDePasseRequestDto $dto */
        $dto = $this->serializer->deserialize(
            $request->getContent(),
            ReinitialiserMotDePasseRequestDto::class,
            'json'
        );
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$this->passwordResetService->resetPassword($dto->token, $dto->nouveauMotDePasse)) {
            return $this->json([
                'success' => false,
                'message' => 'Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau.',
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'success' => true,
            'message' => 'Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.',
            'data' => null,
        ]);
    }
    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'success' => true,
            'data' => $this->authService->buildProfilePayload($utilisateur),
        ]);
    }
    #[Route('/refresh', name: 'api_auth_refresh', methods: ['POST'])]
    public function refresh(): JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'success' => true,
            'message' => 'Token renouvelé',
            'data' => ['token' => $this->authService->generateToken($utilisateur)],
        ]);
    }
    #[Route('/changer-mot-de-passe', name: 'api_auth_changer_mot_de_passe', methods: ['PUT'])]
    public function changerMotDePasse(Request $request): JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        /** @var ChangerMotDePasseRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), ChangerMotDePasseRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $this->authService->changerMotDePasse($utilisateur, $dto);
        } catch (AuthenticationException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
        }
        return $this->json([
            'success' => true,
            'message' => 'Mot de passe changé avec succès.',
            'data' => $this->authService->buildProfilePayload($utilisateur),
        ]);
    }
    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // JWT stateless : la déconnexion est gérée côté client (suppression du token).
        // Cette route reste disponible pour un usage futur (blacklist, audit).
        return $this->json(['success' => true, 'message' => 'Déconnexion effectuée']);
    }
    private function formatViolations(ConstraintViolationListInterface $errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()] = $error->getMessage();
        }
        return $formatted;
    }
}
