<?php

namespace App\Service;
use Doctrine\DBAL\Connection;
/**
 * Ce service interroge directement les vues SQL définies dans database/schema.sql
 * (vue_presence_jour, mv_statistiques_mensuelles_employe) plutôt que de passer par
 * des entités Doctrine : ce sont des agrégats de reporting, pas des entités métier.
 */
class DashboardService
{
    public function __construct(private readonly Connection $connection)
    {
    }
    /**
     * Situation du jour : présents, retards, départs anticipés, absents estimés.
     *
     * @return array<string, mixed>
     */
    public function summary(?\DateTimeInterface $date = null, ?int $serviceId = null): array
    {
        $date ??= new \DateTimeImmutable('today');
        if ($serviceId !== null) {
            return $this->scopedSummary($date, $serviceId);
        }
        $row = $this->connection->fetchAssociative(
            'SELECT date_pointage, nb_presents, nb_retards, nb_departs_anticipes, nb_absents_estimes
             FROM vue_presence_jour
             WHERE date_pointage = :date',
            ['date' => $date->format('Y-m-d')]
        );
        if (!$row) {
            $totalActifs = (int) $this->connection->fetchOne("SELECT COUNT(*) FROM employe WHERE statut = 'actif'");
            return [
                'date' => $date->format('Y-m-d'),
                'nbPresents' => 0,
                'nbRetards' => 0,
                'nbDepartsAnticipes' => 0,
                'nbAbsentsEstimes' => $totalActifs,
            ];
        }
        return [
            'date' => $row['date_pointage'],
            'nbPresents' => (int) $row['nb_presents'],
            'nbRetards' => (int) $row['nb_retards'],
            'nbDepartsAnticipes' => (int) $row['nb_departs_anticipes'],
            'nbAbsentsEstimes' => (int) $row['nb_absents_estimes'],
        ];
    }
    /**
     * Statistiques mensuelles par employé (mois au format 'YYYY-MM', défaut : mois en cours).
     *
     * @return array<int, array<string, mixed>>
     */
    public function statistiquesMensuelles(?string $mois = null, ?int $serviceId = null): array
    {
        $mois ??= (new \DateTimeImmutable('first day of this month'))->format('Y-m');
        $premierJour = $mois.'-01';
        $parameters = ['mois' => $premierJour];
        $scopeFilter = '';
        if ($serviceId !== null) {
            $scopeFilter = ' AND e.service_id = :serviceId';
            $parameters['serviceId'] = $serviceId;
        }
        $rows = $this->connection->fetchAllAssociative(
            'SELECT stats.employe_id, stats.nom, stats.prenom, stats.mois,
                    stats.jours_presents, stats.nb_retards,
                    stats.total_minutes_retard, stats.total_minutes_hs
             FROM mv_statistiques_mensuelles_employe stats
             INNER JOIN employe e ON e.id = stats.employe_id
             WHERE stats.mois = :mois'.$scopeFilter.'
             ORDER BY stats.total_minutes_retard DESC, stats.nom, stats.prenom',
            $parameters
        );
        return array_map(static fn (array $row) => [
            'employeId' => (int) $row['employe_id'],
            'nom' => $row['nom'],
            'prenom' => $row['prenom'],
            'mois' => substr((string) $row['mois'], 0, 7),
            'joursPresents' => (int) $row['jours_presents'],
            'nbRetards' => (int) $row['nb_retards'],
            'totalMinutesRetard' => (int) $row['total_minutes_retard'],
            'totalMinutesHs' => (int) $row['total_minutes_hs'],
        ], $rows);
    }
    /**
     * Rafraîchit la vue matérialisée. À planifier régulièrement (cron + `app:dashboard:refresh-stats`)
     * plutôt qu'à chaque requête, pour ne pas pénaliser les performances.
     */
    public function refreshStatistiquesMensuelles(): void
    {
        $this->connection->executeStatement('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_statistiques_mensuelles_employe');
    }
    /**
     * Recalcule la synthèse à partir des pointages pour limiter les résultats au service
     * du chef ; la vue journalière ne conserve pas l'identifiant du service.
     *
     * @return array<string, mixed>
     */
    private function scopedSummary(\DateTimeInterface $date, int $serviceId): array
    {
        $dateString = $date->format('Y-m-d');
        $row = $this->connection->fetchAssociative(
            'SELECT
                COUNT(DISTINCT CASE WHEN p.statut = :present THEN e.id END) AS nb_presents,
                COUNT(DISTINCT CASE WHEN p.statut = :retard THEN e.id END) AS nb_retards,
                COUNT(DISTINCT CASE WHEN p.statut = :departAnticipe THEN e.id END) AS nb_departs_anticipes,
                COUNT(DISTINCT CASE
                    WHEN p.id IS NULL
                     AND NOT EXISTS (
                         SELECT 1
                         FROM conge c
                         WHERE c.employe_id = e.id
                           AND c.statut = :approuvee
                           AND c.date_debut <= :date
                           AND c.date_fin >= :date
                     )
                    THEN e.id
                END) AS nb_absents_estimes
             FROM employe e
             LEFT JOIN horaire h ON h.id = e.horaire_id
             LEFT JOIN pointage p
               ON p.employe_id = e.id
              AND p.date_pointage = :date
             WHERE e.service_id = :serviceId
               AND e.statut = :actif
               AND (
                   h.id IS NULL
                   OR h.jours_travailles @> ARRAY[
                       CAST(EXTRACT(ISODOW FROM CAST(:date AS DATE)) AS SMALLINT)
                   ]
               )',
            [
                'present' => 'present',
                'retard' => 'retard',
                'departAnticipe' => 'depart_anticipe',
                'approuvee' => 'approuvee',
                'date' => $dateString,
                'serviceId' => $serviceId,
                'actif' => 'actif',
            ]
        );
        return [
            'date' => $dateString,
            'nbPresents' => (int) ($row['nb_presents'] ?? 0),
            'nbRetards' => (int) ($row['nb_retards'] ?? 0),
            'nbDepartsAnticipes' => (int) ($row['nb_departs_anticipes'] ?? 0),
            'nbAbsentsEstimes' => (int) ($row['nb_absents_estimes'] ?? 0),
        ];
    }
}
