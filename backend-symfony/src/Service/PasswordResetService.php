<?php

namespace App\Service;

use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class PasswordResetService
{
    public function __construct(
        private readonly UtilisateurRepository $utilisateurRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly MailerInterface $mailer,
        private readonly string $frontendUrl,
        private readonly string $mailerSender,
        private readonly string $mailerDsn,
    ) {
    }

    public function sendResetLink(string $email): void
    {
        if (str_starts_with(strtolower($this->mailerDsn), 'null://')) {
            throw new PasswordResetUnavailableException();
        }

        $utilisateur = $this->utilisateurRepository->findByEmailCaseInsensitive($email);
        if (!$utilisateur || $utilisateur->getStatut() !== 'actif') {
            return;
        }

        $token = bin2hex(random_bytes(32));
        $utilisateur
            ->setResetPasswordTokenHash(hash('sha256', $token))
            ->setResetPasswordExpiresAt(new \DateTimeImmutable('+30 minutes'));
        $this->entityManager->flush();

        $url = rtrim($this->frontendUrl, '/') . '/mot-de-passe-oublie?token=' . rawurlencode($token);
        $message = (new Email())
            ->from($this->mailerSender)
            ->to($utilisateur->getEmail())
            ->subject('Réinitialisation de votre mot de passe RH-Point')
            ->text(
                "Une demande de réinitialisation du mot de passe de votre compte RH-Point a été reçue.\n\n"
                . "Pour choisir un nouveau mot de passe, ouvrez ce lien dans les 30 minutes :\n{$url}\n\n"
                . "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."
            );

        try {
            $this->mailer->send($message);
        } catch (TransportExceptionInterface $exception) {
            $utilisateur->clearPasswordReset();
            $this->entityManager->flush();
            throw $exception;
        }
    }

    public function resetPassword(string $token, string $newPassword): bool
    {
        $utilisateur = $this->utilisateurRepository->findByPasswordResetTokenHash(hash('sha256', $token));
        if (
            !$utilisateur
            || !$utilisateur->getResetPasswordExpiresAt()
            || $utilisateur->getResetPasswordExpiresAt() <= new \DateTimeImmutable()
            || $utilisateur->getStatut() !== 'actif'
        ) {
            return false;
        }

        $utilisateur
            ->setPassword($this->passwordHasher->hashPassword($utilisateur, $newPassword))
            ->setDoitChangerMotDePasse(false)
            ->clearPasswordReset();
        $this->entityManager->flush();

        return true;
    }
}
