<?php

namespace App\Exception;
/**
 * Levée lorsqu'une ressource demandée n'existe pas (employé, service, horaire...).
 * Traduite en HTTP 404 par le contrôleur.
 */
class RessourceIntrouvableException extends \RuntimeException
{
}
