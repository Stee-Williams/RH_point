<?php

namespace App\Tests\Controller\Api;
use App\Entity\Role;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
class EmployeControllerTest extends WebTestCase
{
    private EntityManagerInterface $em;
    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->em = $kernel->getContainer()->get('doctrine')->getManager();
    }
    private function loginAsAdminRh(): string
    {
        $role = $this->em->getRepository(Role::class)->findOneBy(['nom' => 'ROLE_ADMIN_RH']);
        if (!$role) {
            $role = (new Role())->setNom('ROLE_ADMIN_RH')->setLibelle('Administrateur RH');
            $this->em->persist($role);
        }
        $admin = new Utilisateur();
        $admin->setMatricule('ADM001');
        $admin->setEmail('admin@rhpoint.test');
        $admin->setRole($role);
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $admin->setPassword($hasher->hashPassword($admin, 'Secret123!'));
        $this->em->persist($admin);
        $this->em->flush();
        $jwtManager = self::getContainer()->get('lexik_jwt_authentication.jwt_manager');
        return $jwtManager->create($admin);
    }
    public function testCreateEmployeeReturnsCreatedWithTemporaryPassword(): void
    {
        $client = static::createClient();
        $token = $this->loginAsAdminRh();
        $client->request(
            'POST',
            '/api/employees',
            server: [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer '.$token,
            ],
            content: json_encode([
                'matricule' => 'EMP100',
                'email' => 'nouvel.employe@rhpoint.test',
                'nom' => 'Diallo',
                'prenom' => 'Fatou',
                'dateEmbauche' => '2026-01-15',
            ])
        );
        self::assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertTrue($data['success']);
        self::assertSame('EMP100', $data['data']['employe']['matricule']);
        self::assertNotEmpty($data['data']['motDePasseTemporaire']);
    }
    public function testCreateEmployeeWithDuplicateMatriculeReturns409(): void
    {
        $client = static::createClient();
        $token = $this->loginAsAdminRh();
        $payload = json_encode([
            'matricule' => 'EMP200',
            'email' => 'premier@rhpoint.test',
            'nom' => 'Ba',
            'prenom' => 'Awa',
            'dateEmbauche' => '2026-01-15',
        ]);
        $headers = [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ];
        $client->request('POST', '/api/employees', server: $headers, content: $payload);
        self::assertResponseStatusCodeSame(201);
        $client->request('POST', '/api/employees', server: $headers, content: json_encode([
            'matricule' => 'EMP200',
            'email' => 'second@rhpoint.test',
            'nom' => 'Sow',
            'prenom' => 'Moussa',
            'dateEmbauche' => '2026-01-15',
        ]));
        self::assertResponseStatusCodeSame(409);
    }
    public function testListEmployeesWithoutTokenReturns401(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/employees');
        self::assertResponseStatusCodeSame(401);
    }
    public function testDeactivateUnknownEmployeeReturns404(): void
    {
        $client = static::createClient();
        $token = $this->loginAsAdminRh();
        $client->request('DELETE', '/api/employees/999999', server: [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        self::assertResponseStatusCodeSame(404);
    }
}
