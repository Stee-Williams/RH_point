<?php

namespace App\Controller\Api;
use App\Dto\EmployeCreateRequestDto;
use App\Dto\EmployeUpdateRequestDto;
use App\Entity\Employe;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Service\EmployeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
#[Route('/api/employees')]
class EmployeController extends AbstractController
{
    public function __construct(
        private readonly EmployeService $employeService,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }
    #[Route('', name: 'api_employees_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        $result = $this->employeService->list(
            $request->query->get('q'),
            $request->query->has('serviceId') ? (int) $request->query->get('serviceId') : null,
            $request->query->get('statut'),
            $page,
            $limit
        );
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Employe $e) => $this->toArray($e), $result['items']),
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($result['total'] / max(1, $limit)),
            ],
        ]);
    }
    #[Route('/{id}', name: 'api_employees_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        try {
            $employe = $this->employeService->find($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'data' => $this->toArray($employe)]);
    }
    #[Route('', name: 'api_employees_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var EmployeCreateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), EmployeCreateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $result = $this->employeService->create($dto);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        return $this->json([
            'success' => true,
            'message' => 'Employé créé avec succès.',
            'data' => [
                'employe' => $this->toArray($result['employe']),
                'motDePasseTemporaire' => $result['motDePasseTemporaire'],
            ],
        ], Response::HTTP_CREATED);
    }
    #[Route('/{id}', name: 'api_employees_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var EmployeUpdateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), EmployeUpdateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $employe = $this->employeService->update($id, $dto);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'message' => 'Employé mis à jour.', 'data' => $this->toArray($employe)]);
    }
    #[Route('/{id}', name: 'api_employees_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        try {
            $this->employeService->deactivate($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return new Response(null, Response::HTTP_NO_CONTENT);
    }
    /**
     * @return array<string, mixed>
     */
    private function toArray(Employe $employe): array
    {
        return [
            'id' => $employe->getId(),
            'matricule' => $employe->getUtilisateur()->getMatricule(),
            'email' => $employe->getUtilisateur()->getEmail(),
            'nom' => $employe->getNom(),
            'prenom' => $employe->getPrenom(),
            'telephone' => $employe->getTelephone(),
            'dateNaissance' => $employe->getDateNaissance()?->format('Y-m-d'),
            'dateEmbauche' => $employe->getDateEmbauche()->format('Y-m-d'),
            'poste' => $employe->getPoste(),
            'statut' => $employe->getStatut(),
            'service' => $employe->getService() ? [
                'id' => $employe->getService()->getId(),
                'nom' => $employe->getService()->getNom(),
            ] : null,
            'horaire' => $employe->getHoraire() ? [
                'id' => $employe->getHoraire()->getId(),
                'nom' => $employe->getHoraire()->getNom(),
            ] : null,
        ];
    }
    /**
     * @return array<string, string>
     */
    private function formatViolations(ConstraintViolationListInterface $errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[$error->getPropertyPath()] = $error->getMessage();
        }
        return $formatted;
    }
}
