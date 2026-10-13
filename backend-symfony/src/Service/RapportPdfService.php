<?php

namespace App\Service;
use Dompdf\Dompdf;
use Dompdf\Options;
/**
 * Génère le PDF du rapport de présence à partir des données de RapportService.
 *
 * Nécessite le paquet dompdf/dompdf :
 *   composer require dompdf/dompdf
 *
 * Ce paquet n'a pas pu être installé dans le bac à sable de développement utilisé pour
 * générer ce projet (pas d'accès à Packagist depuis cet environnement). Le code ci-dessous
 * suit l'API stable et documentée de dompdf/dompdf ^3.0 ; seule sa syntaxe PHP a été
 * vérifiée ici (`php -l`), pas son exécution réelle — à tester en priorité une fois le
 * paquet installé dans votre projet.
 */
class RapportPdfService
{
    public function genererRapportPresence(
        array $lignes,
        \DateTimeInterface $dateDebut,
        \DateTimeInterface $dateFin
    ): string {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($this->buildHtml($lignes, $dateDebut, $dateFin));
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();
        return $dompdf->output();
    }
    /**
     * @param array<int, array<string, mixed>> $lignes
     */
    private function buildHtml(array $lignes, \DateTimeInterface $dateDebut, \DateTimeInterface $dateFin): string
    {
        $rows = '';
        foreach ($lignes as $ligne) {
            $rows .= sprintf(
                '<tr><td>%s</td><td>%s</td><td>%s</td><td>%d</td><td>%d</td><td>%d</td><td>%d min</td><td>%d min</td></tr>',
                htmlspecialchars((string) $ligne['prenom']),
                htmlspecialchars((string) $ligne['nom']),
                htmlspecialchars((string) ($ligne['service'] ?? '—')),
                $ligne['joursPresents'],
                $ligne['nbRetards'],
                $ligne['nbDepartsAnticipes'],
                $ligne['totalRetardMinutes'],
                $ligne['totalHsMinutes']
            );
        }
        $periode = sprintf('Période du %s au %s', $dateDebut->format('d/m/Y'), $dateFin->format('d/m/Y'));
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1f2937; }
    h1 { font-size: 16px; margin-bottom: 4px; }
    p.periode { color: #6b7280; margin-top: 0; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
    th { background-color: #f9fafb; }
</style>
</head>
<body>
    <h1>RH-Point — Rapport de présence</h1>
    <p class="periode">{$periode}</p>
    <table>
        <thead>
            <tr>
                <th>Prénom</th><th>Nom</th><th>Service</th>
                <th>Jours présents</th><th>Retards</th><th>Départs anticipés</th>
                <th>Total retard</th><th>Heures sup.</th>
            </tr>
        </thead>
        <tbody>
            {$rows}
        </tbody>
    </table>
</body>
</html>
HTML;
    }
}
