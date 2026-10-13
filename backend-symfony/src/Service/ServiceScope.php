<?php

namespace App\Service;
use App\Entity\Utilisateur;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
class ServiceScope
{
    public function __construct(private readonly Security $security)
    {
    }
    public function isRestrictedManager(): bool
    {
        return $this->security->isGranted('ROLE_CHEF_SERVICE')
            && !$this->security->isGranted('ROLE_ADMIN_RH');
    }
    public function currentServiceId(): int
    {
        if (!$this->isRestrictedManager()) {
            throw new AccessDeniedException('Cette opération est réservée aux chefs de service.');
        }
        $user = $this->security->getUser();
        if (!$user instanceof Utilisateur) {
            throw new AccessDeniedException('Utilisateur non autorisé.');
        }
        $employe = $user->getEmploye();
        $service = $employe?->getService();
        $serviceId = $service?->getId();
        if (
            !$employe
            || $serviceId === null
            || $service->getChefService()?->getId() !== $employe->getId()
        ) {
            throw new AccessDeniedException('Aucun service ne vous est attribué comme responsable.');
        }
        return $serviceId;
    }
}
