<?php

namespace App\Controller\Api;
use App\Entity\Absence;
use App\Repository\AbsenceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
/**
 * Consultation des absences déjà constatées. La génération automatique des
 * absences non justifiées (comparaison quotidienne pointage/horaire) sera
 * ajoutée sous forme de tâche planifiée dans une itération future.
 */
#[Route('/api/absences')]
class AbsenceController extends AbstractController
{
    public function __construct(private readonly AbsenceRepository $absenceRepository)
    {
    }
    #[Route('', name: 'api_absences_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(100, max(1, (int) $request->query->get('limit', 20)));
        $result = $this->absenceRepository->search(
            $request->query->has('serviceId') ? (int) $request->query->get('serviceId') : null,
            $request->query->get('dateDebut'),
            $request->query->get('dateFin'),
            $request->query->get('typeAbsence'),
            $page,
            $limit
        );
        return $this->json([
            'success' => true,
            'data' => array_map(fn (Absence $a) => [
                'id' => $a->getId(),
                'employe' => [
                    'id' => $a->getEmploye()->getId(),
                    'nom' => $a->getEmploye()->getNom(),
                    'prenom' => $a->getEmploye()->getPrenom(),
                ],
                'dateAbsence' => $a->getDateAbsence()->format('Y-m-d'),
                'typeAbsence' => $a->getTypeAbsence(),
            ], $result['items']),
            'meta' => [
                'total' => $result['total'],
                'page' => $page,
                'limit' => $limit,
                'totalPages' => (int) ceil($result['total'] / max(1, $limit)),
            ],
        ]);
    }
}
