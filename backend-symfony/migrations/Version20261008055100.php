<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261008055100 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les champs des jetons de réinitialisation du mot de passe.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur ADD reset_password_token_hash VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD reset_password_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX uniq_utilisateur_reset_password_token_hash ON utilisateur (reset_password_token_hash)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX uniq_utilisateur_reset_password_token_hash');
        $this->addSql('ALTER TABLE utilisateur DROP reset_password_token_hash');
        $this->addSql('ALTER TABLE utilisateur DROP reset_password_expires_at');
    }
}
