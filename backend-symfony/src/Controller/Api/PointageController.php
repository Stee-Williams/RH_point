<?php

namespace App\Controller\Api;
use App\Dto\PointageActionRequestDto;
use App\Entity\Pointage;
use App\Entity\Utilisateur;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Service\PointageService;
use App\Service\ServiceScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
#[Route('/api/pointages')]
class PointageController extends AbstractController
{
    public function __construct(
        private readonly PointageService $pointageService,
        private readonly ServiceScope $serviceScope,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }
    #[Route('/arrivee', name: 'api_pointages_arrivee', methods: ['POST'])]
    public function clockIn(Request $request): JsonResponse
    {
        $employeId = $this->currentEmployeId();
        if ($employeId === null) {
            return $this->json(['success' => false, 'message' => 'Aucune fiche employé associée à ce compte.'], Response::HTTP_FORBIDDEN);
        }
        [$dto, $errorResponse] = $this->parseAndValidate($request);
        if ($errorResponse) {
            return $errorResponse;
        }
        try {
            $pointage = $this->pointageService->clockIn($employeId, $dto);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json([
            'success' => true,
            'message' => 'Arrivée enregistrée.',
            'data' => $this->toArray($pointage),
        ], Response::HTTP_CREATED);
    }
    #[Route('/depart', name: 'api_pointages_depart', methods: ['POST'])]
    public function clockOut(Request $request): JsonResponse
    {
        $employeId = $this->currentEmployeId();
        if ($employeId === null) {
            return $this->json(['success' => false, 'message' => 'Aucune fiche employé associée à ce compte.'], Response::HTTP_FORBIDDEN);
        }
        [$dto, $errorResponse] = $this->parseAndValidate($request);
        if ($errorResponse) {
            return $errorResponse;
        }
        try {
            $pointage = $this->pointageService->clockOut($employeId, $dto);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json([
            'success' => true,
            'message' => 'Départ enregistré.',
            'data' => $this->toArray($pointage),
        ]);
    }
    #[Route('/aujourdhui', name: 'api_pointages_today', methods: ['GET'])]
    public function today(): JsonResponse
    {
        $employeId = $this->currentEmployeId();
        if ($employeId === null) {
            return $this->json(['success' => true, 'data' => null]);
        }
        $pointage = $this->pointageService->todayFor($employeId);
        return $this->json(['success' => true, 'data' => $pointage ? $this->toArray($pointage) : null]);
    }
    #[Route('', name: 'api_pointages_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        // Un simple employé (sans droit ROLE_CHEF_SERVICE) ne voit que son propre historique,
        // quel que soit le paramètre employeId envoyé — jamais faire confiance au frontend ici.
        $isRestrictedToSelf = !$this->isGranted('ROLE_CHEF_SERVICE');
        $employeId = $isRestrictedToSelf
            ? $this->currentEmployeId()
            : ($request->query->has('employeId') ? (int) $request->query->get('employeId') : null);
        $serviceId = $request->query->has('serviceId') ? (int) $request->query->get('serviceId') : null;
        if ($this->serviceScope->isRestrictedManager()) {
            $serviceId = $this->serviceScope->currentServiceId();
        }
        $result = $this->pointageService->search(
            $employeId,
            $serviceId,
            $request->query->get('dateDebut'),
            $request->query->get('dateFin'),
            $request->query->get('statut'),
            $page,
            $limit
        );
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Pointage $p) => $this->toArray($p), $result['items']),
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($result['total'] / max(1, $limit)),
            ],
        ]);
    }
    private function currentEmployeId(): ?int
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return null;
        }
        return $utilisateur->getEmploye()?->getId();
    }
    /**
     * @return array{0: PointageActionRequestDto, 1: ?JsonResponse}
     */
    private function parseAndValidate(Request $request): array
    {
        $content = $request->getContent();
        /** @var PointageActionRequestDto $dto */
        $dto = $content !== ''
            ? $this->serializer->deserialize($content, PointageActionRequestDto::class, 'json')
            : new PointageActionRequestDto();
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return [$dto, $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY)];
        }
        return [$dto, null];
    }
    /** @return array<string, mixed> */
    private function toArray(Pointage $pointage): array
    {
        return [
            'id' => $pointage->getId(),
            'employe' => [
                'id' => $pointage->getEmploye()->getId(),
                'nom' => $pointage->getEmploye()->getNom(),
                'prenom' => $pointage->getEmploye()->getPrenom(),
            ],
            'datePointage' => $pointage->getDatePointage()->format('Y-m-d'),
            'heureArrivee' => $pointage->getHeureArrivee()?->format('H:i'),
            'heureDepart' => $pointage->getHeureDepart()?->format('H:i'),
            'methode' => $pointage->getMethode(),
            'retardMinutes' => $pointage->getRetardMinutes(),
            'heuresSupplementairesMinutes' => $pointage->getHeuresSupplementairesMinutes(),
            'statut' => $pointage->getStatut(),
        ];
    }
    /** @return array<string, string> */
    private function formatViolations(ConstraintViolationListInterface $errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()] = $error->getMessage();
        }
        return $formatted;
    }
}
