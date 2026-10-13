<?php

namespace App\Service;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
/**
 * Génère le classeur Excel du rapport de présence à partir des données de RapportService.
 *
 * Nécessite le paquet phpoffice/phpspreadsheet :
 *   composer require phpoffice/phpspreadsheet
 *
 * Ce paquet n'a pas pu être installé dans le bac à sable de développement utilisé pour
 * générer ce projet (pas d'accès à Packagist depuis cet environnement). Le code ci-dessous
 * suit l'API stable et documentée de PhpSpreadsheet ^2.0 ; seule sa syntaxe PHP a été
 * vérifiée ici (`php -l`), pas son exécution réelle — à tester en priorité une fois le
 * paquet installé dans votre projet.
 */
class RapportExcelService
{
    /**
     * @param array<int, array<string, mixed>> $lignes
     */
    public function genererRapportPresence(array $lignes): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rapport de présence');
        $headers = ['Prénom', 'Nom', 'Service', 'Jours présents', 'Retards', 'Départs anticipés', 'Total retard (min)', 'Heures sup. (min)'];
        $sheet->fromArray($headers, null, 'A1');
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        $row = 2;
        foreach ($lignes as $ligne) {
            $sheet->fromArray([
                $ligne['prenom'],
                $ligne['nom'],
                $ligne['service'] ?? '—',
                $ligne['joursPresents'],
                $ligne['nbRetards'],
                $ligne['nbDepartsAnticipes'],
                $ligne['totalRetardMinutes'],
                $ligne['totalHsMinutes'],
            ], null, 'A'.$row);
            $row++;
        }
        foreach (range('A', 'H') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $writer = new Xlsx($spreadsheet);
        $tmpFile = tempnam(sys_get_temp_dir(), 'rhpoint_rapport_');
        $writer->save($tmpFile);
        $content = file_get_contents($tmpFile);
        unlink($tmpFile);
        return $content !== false ? $content : '';
    }
}
