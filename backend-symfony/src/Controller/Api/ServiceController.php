<?php

namespace App\Controller\Api;
use App\Dto\ServiceCreateRequestDto;
use App\Dto\ServiceUpdateRequestDto;
use App\Entity\Service;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Service\ServiceManagementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
#[Route('/api/services')]
class ServiceController extends AbstractController
{
    public function __construct(
        private readonly ServiceManagementService $serviceManagementService,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }
    #[Route('', name: 'api_services_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $services = $this->serviceManagementService->list();
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Service $s) => $this->toArray($s), $services),
        ]);
    }
    #[Route('/{id}', name: 'api_services_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        try {
            $service = $this->serviceManagementService->find($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'data' => $this->toArray($service)]);
    }
    #[Route('', name: 'api_services_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var ServiceCreateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), ServiceCreateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $service = $this->serviceManagementService->create($dto);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        return $this->json([
            'success' => true,
            'message' => 'Service créé.',
            'data' => $this->toArray($service),
        ], Response::HTTP_CREATED);
    }
    #[Route('/{id}', name: 'api_services_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var ServiceUpdateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), ServiceUpdateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $service = $this->serviceManagementService->update($id, $dto);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'message' => 'Service mis à jour.', 'data' => $this->toArray($service)]);
    }
    #[Route('/{id}', name: 'api_services_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        try {
            $this->serviceManagementService->delete($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }
        return new Response(null, Response::HTTP_NO_CONTENT);
    }
    /** @return array<string, mixed> */
    private function toArray(Service $service): array
    {
        return [
            'id' => $service->getId(),
            'nom' => $service->getNom(),
            'description' => $service->getDescription(),
            'chefService' => $service->getChefService() ? [
                'id' => $service->getChefService()->getId(),
                'nom' => $service->getChefService()->getNom(),
                'prenom' => $service->getChefService()->getPrenom(),
            ] : null,
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
