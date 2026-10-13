<?php

namespace App\Controller\Api;
use App\Service\DashboardService;
use App\Service\ServiceScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
#[Route('/api/dashboard')]
class DashboardController extends AbstractController
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly ServiceScope $serviceScope,
    ) {
    }
    #[Route('/summary', name: 'api_dashboard_summary', methods: ['GET'])]
    public function summary(Request $request): JsonResponse
    {
        $dateParam = $request->query->get('date');
        if ($dateParam !== null && !is_string($dateParam)) {
            return $this->json([
                'success' => false,
                'message' => 'La date doit respecter le format YYYY-MM-DD.',
                'errors' => ['date' => 'Format de date invalide.'],
            ], 422);
        }
        $date = $dateParam !== null
            ? \DateTimeImmutable::createFromFormat('!Y-m-d', $dateParam)
            : null;
        $dateErrors = \DateTimeImmutable::getLastErrors();
        if (
            $dateParam !== null
            && (
                $date === false
                || ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0))
                || $date->format('Y-m-d') !== $dateParam
            )
        ) {
            return $this->json([
                'success' => false,
                'message' => 'La date doit exister et respecter le format YYYY-MM-DD.',
                'errors' => ['date' => 'Date invalide.'],
            ], 422);
        }
        $serviceId = $this->serviceScope->isRestrictedManager()
            ? $this->serviceScope->currentServiceId()
            : null;
        return $this->json([
            'success' => true,
            'data' => $this->dashboardService->summary($date, $serviceId),
        ]);
    }
    #[Route('/stats-mensuelles', name: 'api_dashboard_stats_mensuelles', methods: ['GET'])]
    public function statsMensuelles(Request $request): JsonResponse
    {
        $mois = $request->query->get('mois');
        if (
            $mois !== null
            && (!is_string($mois) || preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $mois) !== 1)
        ) {
            return $this->json([
                'success' => false,
                'message' => 'Le mois doit respecter le format YYYY-MM.',
                'errors' => ['mois' => 'Format de mois invalide.'],
            ], 422);
        }
        $serviceId = $this->serviceScope->isRestrictedManager()
            ? $this->serviceScope->currentServiceId()
            : null;
        return $this->json([
            'success' => true,
            'data' => $this->dashboardService->statistiquesMensuelles(
                $mois,
                $serviceId
            ),
        ]);
    }
}
