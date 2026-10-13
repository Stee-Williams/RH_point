<?php

namespace App\Command;
use App\Service\AbsenceGenerationService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
#[AsCommand(
    name: 'app:absences:generate',
    description: "Génère les constats d'absence pour une date donnée (par défaut : hier). À planifier quotidiennement en cron."
)]
class GenerateAbsencesCommand extends Command
{
    public function __construct(private readonly AbsenceGenerationService $absenceGenerationService)
    {
        parent::__construct();
    }
    protected function configure(): void
    {
        $this->addArgument('date', InputArgument::OPTIONAL, 'Date au format YYYY-MM-DD (défaut : hier)');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $dateArg = $input->getArgument('date');
        $date = $dateArg ? new \DateTimeImmutable($dateArg) : new \DateTimeImmutable('yesterday');
        $result = $this->absenceGenerationService->generatePourDate($date);
        $io->success(sprintf(
            "Absences générées pour le %s : %d créée(s), %d employé(s) ignoré(s) (présent, congé couvrant, ou jour non travaillé).",
            $date->format('d/m/Y'),
            $result['creees'],
            $result['ignorees']
        ));
        return Command::SUCCESS;
    }
}
