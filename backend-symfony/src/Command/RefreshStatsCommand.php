<?php

namespace App\Command;
use App\Service\DashboardService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
#[AsCommand(
    name: 'app:dashboard:refresh-stats',
    description: 'Rafraîchit la vue matérialisée des statistiques mensuelles (mv_statistiques_mensuelles_employe)'
)]
class RefreshStatsCommand extends Command
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
        parent::__construct();
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->dashboardService->refreshStatistiquesMensuelles();
        $output->writeln('Statistiques mensuelles rafraîchies.');
        return Command::SUCCESS;
    }
}
