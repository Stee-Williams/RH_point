<?php

namespace App\Exception;
/**
 * Levée lorsqu'une opération entre en conflit avec une contrainte métier
 * (ex : matricule ou email déjà utilisé). Traduite en HTTP 409 par le contrôleur.
 */
class ConflitMetierException extends \RuntimeException
{
}
