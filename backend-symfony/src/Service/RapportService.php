<?php

namespace App\Service;
use Doctrine\DBAL\Connection;
/**
 * Génère les données agrégées des rapports (journalier, hebdomadaire, mensuel,
 * fiche individuelle, état des retards) sous forme structurée.
 *
 * NOTE — export PDF/Excel : ce service fournit les données ; la mise en forme
 * binaire (PDF via dompdf, Excel via phpoffice/phpspreadsheet) n'est pas encore
 * branchée ici car elle nécessite d'ajouter ces paquets via composer dans
 * l'environnement réel du projet (composer require dompdf/dompdf
 * phpoffice/phpspreadsheet). Le frontend propose en attendant un export CSV
 * généré côté client à partir de ces mêmes données.
 */
class RapportService
{
    public function __construct(private readonly Connection $connection)
    {
    }
    /**
     * Rapport de présence agrégé sur une période, par employé.
     * - dateDebut = dateFin              -> rapport journalier
     * - période plus large                -> rapport hebdomadaire / mensuel
     * - employeId renseigné               -> fiche individuelle
     *
     * @return array<int, array<string, mixed>>
     */
    public function rapportPresence(
        \DateTimeInterface $dateDebut,
        \DateTimeInterface $dateFin,
        ?int $serviceId = null,
        ?int $employeId = null
    ): array {
        $rows = $this->connection->fetchAllAssociative(
            'SELECT
                e.id AS employe_id,
                e.nom,
                e.prenom,
                s.nom AS service,
                COUNT(p.id) FILTER (WHERE p.statut IN (\'present\', \'retard\')) AS jours_presents,
                COUNT(p.id) FILTER (WHERE p.statut = \'retard\') AS nb_retards,
                COUNT(p.id) FILTER (WHERE p.statut = \'depart_anticipe\') AS nb_departs_anticipes,
                COALESCE(SUM(p.retard_minutes), 0) AS total_retard_minutes,
                COALESCE(SUM(p.heures_supplementaires_minutes), 0) AS total_hs_minutes
             FROM employe e
             LEFT JOIN service s ON s.id = e.service_id
             LEFT JOIN pointage p
                ON p.employe_id = e.id
               AND p.date_pointage BETWEEN :dateDebut AND :dateFin
             WHERE e.statut = \'actif\'
               AND (:serviceId::int IS NULL OR e.service_id = :serviceId)
               AND (:employeId::int IS NULL OR e.id = :employeId)
             GROUP BY e.id, e.nom, e.prenom, s.nom
             ORDER BY e.nom, e.prenom',
            [
                'dateDebut' => $dateDebut->format('Y-m-d'),
                'dateFin' => $dateFin->format('Y-m-d'),
                'serviceId' => $serviceId,
                'employeId' => $employeId,
            ]
        );
        return array_map(static fn (array $row) => [
            'employeId' => (int) $row['employe_id'],
            'nom' => $row['nom'],
            'prenom' => $row['prenom'],
            'service' => $row['service'],
            'joursPresents' => (int) $row['jours_presents'],
            'nbRetards' => (int) $row['nb_retards'],
            'nbDepartsAnticipes' => (int) $row['nb_departs_anticipes'],
            'totalRetardMinutes' => (int) $row['total_retard_minutes'],
            'totalHsMinutes' => (int) $row['total_hs_minutes'],
        ], $rows);
    }
    /**
     * État des absences sur une période (justifiées / non justifiées).
     *
     * @return array<int, array<string, mixed>>
     */
    public function etatAbsences(\DateTimeInterface $dateDebut, \DateTimeInterface $dateFin, ?int $serviceId = null): array
    {
        $rows = $this->connection->fetchAllAssociative(
            'SELECT e.id AS employe_id, e.nom, e.prenom, s.nom AS service,
                    COUNT(a.id) FILTER (WHERE a.type_absence = \'justifiee\') AS absences_justifiees,
                    COUNT(a.id) FILTER (WHERE a.type_absence = \'non_justifiee\') AS absences_non_justifiees
             FROM employe e
             LEFT JOIN service s ON s.id = e.service_id
             LEFT JOIN absence a
                ON a.employe_id = e.id
               AND a.date_absence BETWEEN :dateDebut AND :dateFin
             WHERE e.statut = \'actif\'
               AND (:serviceId::int IS NULL OR e.service_id = :serviceId)
             GROUP BY e.id, e.nom, e.prenom, s.nom
             HAVING COUNT(a.id) > 0
             ORDER BY absences_non_justifiees DESC, e.nom',
            [
                'dateDebut' => $dateDebut->format('Y-m-d'),
                'dateFin' => $dateFin->format('Y-m-d'),
                'serviceId' => $serviceId,
            ]
        );
        return array_map(static fn (array $row) => [
            'employeId' => (int) $row['employe_id'],
            'nom' => $row['nom'],
            'prenom' => $row['prenom'],
            'service' => $row['service'],
            'absencesJustifiees' => (int) $row['absences_justifiees'],
            'absencesNonJustifiees' => (int) $row['absences_non_justifiees'],
        ], $rows);
    }
}
