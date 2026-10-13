<?php

namespace App\Service;
use App\Dto\ServiceCreateRequestDto;
use App\Dto\ServiceUpdateRequestDto;
use App\Entity\Service as ServiceEntity;
use App\Exception\ConflitMetierException;
use App\Exception\RessourceIntrouvableException;
use App\Repository\EmployeRepository;
use App\Repository\ServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
class ServiceManagementService
{
    public function __construct(
        private readonly ServiceRepository $serviceRepository,
        private readonly EmployeRepository $employeRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }
    /** @return ServiceEntity[] */
    public function list(): array
    {
        return $this->serviceRepository->findBy([], ['nom' => 'ASC']);
    }
    public function find(int $id): ServiceEntity
    {
        $service = $this->serviceRepository->find($id);
        if (!$service) {
            throw new RessourceIntrouvableException('Service introuvable.');
        }
        return $service;
    }
    public function create(ServiceCreateRequestDto $dto): ServiceEntity
    {
        if ($this->serviceRepository->findOneBy(['nom' => $dto->nom])) {
            throw new ConflitMetierException('Un service avec ce nom existe déjà.');
        }
        $service = new ServiceEntity();
        $service->setNom($dto->nom);
        $service->setDescription($dto->description);
        $service->setChefService($this->resolveChef($dto->chefServiceId));
        $this->em->persist($service);
        $this->em->flush();
        return $service;
    }
    public function update(int $id, ServiceUpdateRequestDto $dto): ServiceEntity
    {
        $service = $this->find($id);
        $service->setNom($dto->nom);
        $service->setDescription($dto->description);
        $service->setChefService($this->resolveChef($dto->chefServiceId));
        $this->em->flush();
        return $service;
    }
    /**
     * Empêche la suppression d'un service encore assigné à des employés
     * (il faut d'abord les réaffecter à un autre service).
     */
    public function delete(int $id): void
    {
        $service = $this->find($id);
        $nbEmployes = $this->employeRepository->count(['service' => $service]);
        if ($nbEmployes > 0) {
            throw new ConflitMetierException(
                sprintf('Impossible de supprimer ce service : %d employé(s) y sont encore rattaché(s).', $nbEmployes)
            );
        }
        $this->em->remove($service);
        $this->em->flush();
    }
    private function resolveChef(?int $chefServiceId): ?\App\Entity\Employe
    {
        if ($chefServiceId === null) {
            return null;
        }
        $chef = $this->employeRepository->find($chefServiceId);
        if (!$chef) {
            throw new RessourceIntrouvableException('Le chef de service désigné est introuvable.');
        }
        return $chef;
    }
}
