<?php

namespace App\Service;
use App\Dto\HoraireCreateRequestDto;
use App\Dto\HoraireUpdateRequestDto;
use App\Entity\Horaire;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Repository\EmployeRepository;
use App\Repository\HoraireRepository;
use Doctrine\ORM\EntityManagerInterface;
class HoraireManagementService
{
    public function __construct(
        private readonly HoraireRepository $horaireRepository,
        private readonly EmployeRepository $employeRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /** @return Horaire[] */
    public function list(): array
    {
        return $this->horaireRepository->findBy([], ['nom' => 'ASC']);
    }
    public function find(int $id): Horaire
    {
        $horaire = $this->horaireRepository->find($id);
        if (!$horaire) {
            throw new RessourceIntrouvableException('Horaire introuvable.');
        }
        return $horaire;
    }
    public function create(HoraireCreateRequestDto $dto): Horaire
    {
        $horaire = new Horaire();
        $this->hydrate($horaire, $dto);
        $this->em->persist($horaire);
        $this->em->flush();
        return $horaire;
    }
    public function update(int $id, HoraireUpdateRequestDto $dto): Horaire
    {
        $horaire = $this->find($id);
        $this->hydrate($horaire, $dto);
        $this->em->flush();
        return $horaire;
    }
    /**
     * Empêche la suppression d'un horaire encore assigné à des employés.
     */
    public function delete(int $id): void
    {
        $horaire = $this->find($id);
        $nbEmployes = $this->employeRepository->count(['horaire' => $horaire]);
        if ($nbEmployes > 0) {
            throw new ConflitMetierException(
                sprintf('Impossible de supprimer cet horaire : %d employé(s) y sont encore rattaché(s).', $nbEmployes)
            );
        }
        $this->em->remove($horaire);
        $this->em->flush();
    }
    /**
     * @param HoraireCreateRequestDto|HoraireUpdateRequestDto $dto
     */
    private function hydrate(Horaire $horaire, $dto): void
    {
        $horaire->setNom($dto->nom);
        $horaire->setHeureDebut(new \DateTimeImmutable($dto->heureDebut));
        $horaire->setHeureFin(new \DateTimeImmutable($dto->heureFin));
        if ($dto->joursTravailles !== null) {
            $horaire->setJoursTravailles($dto->joursTravailles);
        }
        if ($dto->dureePauseMinutes !== null) {
            $horaire->setDureePauseMinutes($dto->dureePauseMinutes);
        }
        if ($dto->toleranceRetardMinutes !== null) {
            $horaire->setToleranceRetardMinutes($dto->toleranceRetardMinutes);
        }
    }
}
