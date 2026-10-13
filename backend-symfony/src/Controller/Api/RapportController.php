<?php

namespace App\Controller\Api;
use App\Service\RapportExcelService;
use App\Service\RapportPdfService;
use App\Service\RapportService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
#[Route('/api/rapports')]
class RapportController extends AbstractController
{
    public function __construct(private readonly RapportService $rapportService)
    {
    }
    /**
     * Rapport de présence agrégé (JSON). Couvre journalier/hebdomadaire/mensuel selon la
     * période fournie, et fiche individuelle si employeId est renseigné.
     */
    #[Route('/presence', name: 'api_rapports_presence', methods: ['GET'])]
    public function presence(Request $request): JsonResponse
    {
        $period = $this->resolvePeriod($request);
        if ($period instanceof JsonResponse) {
            return $period;
        }
        [$dateDebut, $dateFin] = $period;
        $data = $this->rapportService->rapportPresence(
            $dateDebut,
            $dateFin,
            $this->intQueryParam($request, 'serviceId'),
            $this->intQueryParam($request, 'employeId')
        );
        return $this->json(['success' => true, 'data' => $data]);
    }
    /**
     * Même rapport que ci-dessus, au format PDF téléchargeable.
     *
     * NOTE : nécessite dompdf/dompdf (composer require dompdf/dompdf), non installé dans
     * le bac à sable utilisé pour générer ce projet — voir RapportPdfService pour le détail.
     */
    #[Route('/presence/pdf', name: 'api_rapports_presence_pdf', methods: ['GET'])]
    public function presencePdf(Request $request, RapportPdfService $pdfService): Response
    {
        $period = $this->resolvePeriod($request);
        if ($period instanceof JsonResponse) {
            return $period;
        }
        [$dateDebut, $dateFin] = $period;
        $data = $this->rapportService->rapportPresence(
            $dateDebut,
            $dateFin,
            $this->intQueryParam($request, 'serviceId'),
            $this->intQueryParam($request, 'employeId')
        );
        $pdf = $pdfService->genererRapportPresence($data, $dateDebut, $dateFin);
        return new Response($pdf, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf(
                'attachment; filename="rapport-presence_%s_%s.pdf"',
                $dateDebut->format('Y-m-d'),
                $dateFin->format('Y-m-d')
            ),
        ]);
    }
    /**
     * Même rapport que ci-dessus, au format Excel (.xlsx) téléchargeable.
     *
     * NOTE : nécessite phpoffice/phpspreadsheet (composer require phpoffice/phpspreadsheet),
     * non installé dans le bac à sable utilisé pour générer ce projet — voir
     * RapportExcelService pour le détail.
     */
    #[Route('/presence/excel', name: 'api_rapports_presence_excel', methods: ['GET'])]
    public function presenceExcel(Request $request, RapportExcelService $excelService): Response
    {
        $period = $this->resolvePeriod($request);
        if ($period instanceof JsonResponse) {
            return $period;
        }
        [$dateDebut, $dateFin] = $period;
        $data = $this->rapportService->rapportPresence(
            $dateDebut,
            $dateFin,
            $this->intQueryParam($request, 'serviceId'),
            $this->intQueryParam($request, 'employeId')
        );
        $content = $excelService->genererRapportPresence($data);
        return new Response($content, Response::HTTP_OK, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => sprintf(
                'attachment; filename="rapport-presence_%s_%s.xlsx"',
                $dateDebut->format('Y-m-d'),
                $dateFin->format('Y-m-d')
            ),
        ]);
    }
    /**
     * État des absences (justifiées / non justifiées) sur une période.
     */
    #[Route('/absences', name: 'api_rapports_absences', methods: ['GET'])]
    public function absences(Request $request): JsonResponse
    {
        $period = $this->resolvePeriod($request);
        if ($period instanceof JsonResponse) {
            return $period;
        }
        [$dateDebut, $dateFin] = $period;
        $data = $this->rapportService->etatAbsences($dateDebut, $dateFin, $this->intQueryParam($request, 'serviceId'));
        return $this->json(['success' => true, 'data' => $data]);
    }
    /**
     * @return array{0: \DateTimeImmutable, 1: \DateTimeImmutable}|JsonResponse
     */
    private function resolvePeriod(Request $request): array|JsonResponse
    {
        $dateDebutParam = $request->query->get('dateDebut');
        $dateFinParam = $request->query->get('dateFin');
        if (!is_string($dateDebutParam) || !is_string($dateFinParam)) {
            return $this->json([
                'success' => false,
                'message' => 'Les paramètres dateDebut et dateFin sont obligatoires (format YYYY-MM-DD).',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $dateDebut = $this->parseDate($dateDebutParam);
        $dateFin = $this->parseDate($dateFinParam);
        if ($dateDebut === null || $dateFin === null) {
            $errors = [];
            if ($dateDebut === null) {
                $errors['dateDebut'] = 'Date invalide.';
            }
            if ($dateFin === null) {
                $errors['dateFin'] = 'Date invalide.';
            }
            return $this->json([
                'success' => false,
                'message' => 'Les dates doivent exister et respecter le format YYYY-MM-DD.',
                'errors' => $errors,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        if ($dateFin < $dateDebut) {
            return $this->json([
                'success' => false,
                'message' => 'La date de fin doit être postérieure ou égale à la date de début.',
                'errors' => ['dateFin' => 'Choisissez une date égale ou postérieure à la date de début.'],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        return [$dateDebut, $dateFin];
    }
    private function parseDate(string $value): ?\DateTimeImmutable
    {
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = \DateTimeImmutable::getLastErrors();
        if (
            $date === false
            || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))
            || $date->format('Y-m-d') !== $value
        ) {
            return null;
        }
        return $date;
    }
    private function intQueryParam(Request $request, string $name): ?int
    {
        return $request->query->has($name) ? (int) $request->query->get($name) : null;
    }
}
