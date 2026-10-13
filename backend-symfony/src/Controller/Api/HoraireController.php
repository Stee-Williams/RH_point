<?php

namespace App\Controller\Api;
use App\Dto\HoraireCreateRequestDto;
use App\Dto\HoraireUpdateRequestDto;
use App\Entity\Horaire;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Service\HoraireManagementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
#[Route('/api/horaires')]
class HoraireController extends AbstractController
{
    public function __construct(
        private readonly HoraireManagementService $horaireManagementService,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }
    #[Route('', name: 'api_horaires_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $horaires = $this->horaireManagementService->list();
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Horaire $h) => $this->toArray($h), $horaires),
        ]);
    }
    #[Route('/{id}', name: 'api_horaires_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        try {
            $horaire = $this->horaireManagementService->find($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'data' => $this->toArray($horaire)]);
    }
    #[Route('', name: 'api_horaires_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var HoraireCreateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), HoraireCreateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $horaire = $this->horaireManagementService->create($dto);
        return $this->json([
            'success' => true,
            'message' => 'Horaire créé.',
            'data' => $this->toArray($horaire),
        ], Response::HTTP_CREATED);
    }
    #[Route('/{id}', name: 'api_horaires_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        /** @var HoraireUpdateRequestDto $dto */
        $dto = $this->serializer->deserialize($request->getContent(), HoraireUpdateRequestDto::class, 'json');
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $this->formatViolations($errors),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        try {
            $horaire = $this->horaireManagementService->update($id, $dto);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        }
        return $this->json(['success' => true, 'message' => 'Horaire mis à jour.', 'data' => $this->toArray($horaire)]);
    }
    #[Route('/{id}', name: 'api_horaires_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): Response
    {
        try {
            $this->horaireManagementService->delete($id);
        } catch (RessourceIntrouvableException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (ConflitMetierException $e) {
            return $this->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_CONFLICT);
        }
        return new Response(null, Response::HTTP_NO_CONTENT);
    }
    /** @return array<string, mixed> */
    private function toArray(Horaire $horaire): array
    {
        return [
            'id' => $horaire->getId(),
            'nom' => $horaire->getNom(),
            'heureDebut' => $horaire->getHeureDebut()->format('H:i'),
            'heureFin' => $horaire->getHeureFin()->format('H:i'),
            'joursTravailles' => $horaire->getJoursTravailles(),
            'dureePauseMinutes' => $horaire->getDureePauseMinutes(),
            'toleranceRetardMinutes' => $horaire->getToleranceRetardMinutes(),
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
