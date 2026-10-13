<?php

namespace App\Controller\Api;
use App\Dto\CongeCreateRequestDto;
use App\Dto\CongeDecisionRequestDto;
use App\Entity\Conge;
use App\Entity\Utilisateur;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Service\CongeService;
use App\Service\ServiceScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
#[Route('/api/conges')]
class CongeController extends AbstractController
{
    public function __construct(
        private readonly CongeService $congeService,
        private readonly ServiceScope $serviceScope,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }
    #[Route('', name: 'api_conges_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        // Un simple employé ne voit que ses propres demandes.
        $isRestrictedToSelf = !$this->isGranted('ROLE_CHEF_SERVICE');
        $employeId = $isRestrictedToSelf
            ? $this->currentEmployeId()
            : ($request->query->has('employeId') ? (int) $request->query->get('employeId') : null);
        $serviceId = $request->query->has('serviceId') ? (int) $request->query->get('serviceId') : null;
        if ($this->serviceScope->isRestrictedManager()) {
            $serviceId = $this->serviceScope->currentServiceId();
        }
        $result = $this->congeService->list(
            $employeId,
            $serviceId,
            $request->query->get('statut'),
            $page,
            $limit
        );
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Conge $c) => $this->toArray($c), $result['items']),
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($result['total'] / max(1, $limit)),
            ],
        ]);
    }
    #[Route('', name: 'api_conges_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $employeId = $this->currentEmployeId();
        if ($employeId === null) {
            return $this->json(['success' => false, 'message' => 'Aucune fiche employé associée à ce compte.'], Response::HTTP_FORBIDDEN);
        }
        /** @var CongeCreateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), CongeCreateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $conge = $this->congeService->create($employeId, $dto);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json([
            'success' => true,
            'message' => 'Demande envoyée.',
            'data' => $this->toArray($conge),
        ], Response::HTTP_CREATED);
    }
    #[Route('/{id}/approuver', name: 'api_conges_approuver', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function approve(int $id, Request $request): JsonResponse
    {
        return $this->decide($id, $request, true);
    }
    #[Route('/{id}/refuser', name: 'api_conges_refuser', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function reject(int $id, Request $request): JsonResponse
    {
        return $this->decide($id, $request, false);
    }
    private function decide(int $id, Request $request, bool $approve): JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['success' => false, 'message' => 'Non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }
        $content = $request->getContent();
        $serviceScopeId = $this->serviceScope->isRestrictedManager()
            ? $this->serviceScope->currentServiceId()
            : null;
        /** @var CongeDecisionRequestDto $dto */
        $dto = $content !== ''
            ? $this->serializer->deserialize($content, CongeDecisionRequestDto::class, 'json')
            : new CongeDecisionRequestDto();
        try {
            $conge = $approve
                ? $this->congeService->approve($id, $utilisateur, $dto, $serviceScopeId)
                : $this->congeService->reject($id, $utilisateur, $dto, $serviceScopeId);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }
        return $this->json([
            'success' => true,
            'message' => $approve ? 'Demande approuvée.' : 'Demande refusée.',
            'data' => $this->toArray($conge),
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
    /** @return array<string, mixed> */
    private function toArray(Conge $conge): array
    {
        return [
            'id' => $conge->getId(),
            'employe' => [
                'id' => $conge->getEmploye()->getId(),
                'nom' => $conge->getEmploye()->getNom(),
                'prenom' => $conge->getEmploye()->getPrenom(),
            ],
            'typeConge' => $conge->getTypeConge(),
            'dateDebut' => $conge->getDateDebut()->format('Y-m-d'),
            'dateFin' => $conge->getDateFin()->format('Y-m-d'),
            'motif' => $conge->getMotif(),
            'justificatifUrl' => $conge->getJustificatifUrl(),
            'statut' => $conge->getStatut(),
            'validePar' => $conge->getValidePar()?->getMatricule(),
            'dateDemande' => $conge->getDateDemande()->format('Y-m-d H:i'),
            'dateTraitement' => $conge->getDateTraitement()?->format('Y-m-d H:i'),
            'commentaireValidation' => $conge->getCommentaireValidation(),
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
