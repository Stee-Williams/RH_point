<?php

namespace App\Tests\Controller\Api;
use App\Entity\Role;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
class AuthControllerTest extends WebTestCase
{
    private EntityManagerInterface $em;
    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $this->em = $kernel->getContainer()->get('doctrine')->getManager();
    }
    private function createTestUser(string $matricule, string $password, string $roleNom): Utilisateur
    {
        $role = $this->em->getRepository(Role::class)->findOneBy(['nom' => $roleNom]);
        if (!$role) {
            $role = (new Role())->setNom($roleNom)->setLibelle($roleNom);
            $this->em->persist($role);
        }
        $utilisateur = new Utilisateur();
        $utilisateur->setMatricule($matricule);
        $utilisateur->setEmail($matricule.'@rhpoint.test');
        $utilisateur->setRole($role);
        $utilisateur->setStatut('actif');
        $hasher = self::getContainer()->get(UserPasswordHasherInterface::class);
        $utilisateur->setPassword($hasher->hashPassword($utilisateur, $password));
        $this->em->persist($utilisateur);
        $this->em->flush();
        return $utilisateur;
    }
    public function testLoginWithValidCredentialsReturnsToken(): void
    {
        $client = static::createClient();
        $this->createTestUser('TST001', 'Secret123!', 'ROLE_EMPLOYE');
        $client->request(
            'POST',
            '/api/auth/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['matricule' => 'TST001', 'motDePasse' => 'Secret123!'])
        );
        self::assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        self::assertTrue($data['success']);
        self::assertArrayHasKey('token', $data['data']);
        self::assertSame('TST001', $data['data']['user']['matricule']);
    }
    public function testLoginWithWrongPasswordReturns401(): void
    {
        $client = static::createClient();
        $this->createTestUser('TST002', 'Secret123!', 'ROLE_EMPLOYE');
        $client->request(
            'POST',
            '/api/auth/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['matricule' => 'TST002', 'motDePasse' => 'MauvaisMotDePasse'])
        );
        self::assertResponseStatusCodeSame(401);
    }
    public function testLoginWithUnknownMatriculeReturns401(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/auth/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['matricule' => 'INCONNU', 'motDePasse' => 'Peu importe'])
        );
        self::assertResponseStatusCodeSame(401);
    }
    public function testMeWithoutTokenReturns401(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/auth/me');
        self::assertResponseStatusCodeSame(401);
    }
}
