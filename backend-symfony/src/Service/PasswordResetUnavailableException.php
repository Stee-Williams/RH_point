<?php

namespace App\Service;

use RuntimeException;

final class PasswordResetUnavailableException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Le transport e-mail de réinitialisation n’est pas configuré.');
    }
}
