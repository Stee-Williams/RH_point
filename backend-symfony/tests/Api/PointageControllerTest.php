<?php

namespace App\Tests\Controller\Api;
use App\Entity\Employe;
use App\Entity\Horaire;
use App\Entity\Role;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
class PointageControllerTest extends WebTestCase
{
    private EntityManagerInterface $em;
    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->em = $kernel->getContainer()->get('doctrine')->getManager();
    }
    private function loginAsEmploye(string $matricule): string
    {
        $role = $this->em->getRepository(Role::class)->findOneBy(['nom' => 'ROLE_EMPLOYE']);
        if (!$role) {
            $role = (new Role())->setNom('ROLE_EMPLOYE')->setLibelle('Employé');
            $this->em->persist($role);
        }
        $horaire = $this->em->getRepository(Horaire::class)->findOneBy([]);
        if (!$horaire) {
            $horaire = (new Horaire())
                ->setNom('Standard')
                ->setHeureDebut(new \DateTimeImmutable('08:00'))
                ->setHeureFin(new \DateTimeImmutable('17:00'));
            $this->em->persist($horaire);
        }
        $utilisateur = new Utilisateur();
        $utilisateur->setMatricule($matricule);
        $utilisateur->setEmail($matricule.'@rhpoint.test');
        $utilisateur->setRole($role);
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $utilisateur->setPassword($hasher->hashPassword($utilisateur, 'Secret123!'));
        $employe = new Employe();
        $employe->setUtilisateur($utilisateur);
        $employe->setHoraire($horaire);
        $employe->setNom('Test');
        $employe->setPrenom('Pointage');
        $employe->setDateEmbauche(new \DateTimeImmutable('2025-01-01'));
        $this->em->persist($utilisateur);
        $this->em->persist($employe);
        $this->em->flush();
        $jwtManager = self::getContainer()->get('lexik_jwt_authentication.jwt_manager');
        return $jwtManager->create($utilisateur);
    }
    public function testClockInThenClockOutSucceeds(): void
    {
        $client = static::createClient();
        $token = $this->loginAsEmploye('PTG001');
        $headers = ['CONTENT_TYPE' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer '.$token];
        $client->request('POST', '/api/pointages/arrivee', server: $headers, content: json_encode(['methode' => 'bouton']));
        self::assertResponseStatusCodeSame(201);
        $client->request('POST', '/api/pointages/depart', server: $headers, content: json_encode(['methode' => 'bouton']));
        self::assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertNotNull($data['data']['heureDepart']);
    }
    public function testDoubleClockInIsRejected(): void
    {
        $client = static::createClient();
        $token = $this->loginAsEmploye('PTG002');
        $headers = ['CONTENT_TYPE' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer '.$token];
        $client->request('POST', '/api/pointages/arrivee', server: $headers, content: json_encode(['methode' => 'bouton']));
        self::assertResponseStatusCodeSame(201);
        $client->request('POST', '/api/pointages/arrivee', server: $headers, content: json_encode(['methode' => 'bouton']));
        self::assertResponseStatusCodeSame(409);
    }
    public function testClockOutWithoutClockInIsRejected(): void
    {
        $client = static::createClient();
        $token = $this->loginAsEmploye('PTG003');
        $headers = ['CONTENT_TYPE' => 'application/json', 'HTTP_AUTHORIZATION' => 'Bearer '.$token];
        $client->request('POST', '/api/pointages/depart', server: $headers, content: json_encode(['methode' => 'bouton']));
        self::assertResponseStatusCodeSame(409);
    }
}
