<?php

namespace App\Doctrine\Types;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;
/**
 * Mappe une colonne PostgreSQL SMALLINT[] (ex: horaire.jours_travailles) vers un
 * tableau PHP d'entiers, dans les deux sens.
 *
 * Exemple : '{1,2,3,4,5}' <-> [1, 2, 3, 4, 5]
 */
class SmallIntArrayType extends Type
{
    public const NAME = 'smallint_array';
    public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
    {
        return 'SMALLINT[]';
    }
    /**
     * @return int[]|null
     */
    public function convertToPHPValue($value, AbstractPlatform $platform): ?array
    {
        if ($value === null) {
            return null;
        }
        $trimmed = trim((string) $value, '{}');
        if ($trimmed === '') {
            return [];
        }
        return array_map('intval', explode(',', $trimmed));
    }
    /**
     * @param int[]|null $value
     */
    public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
    {
        if ($value === null) {
            return null;
        }
        return '{'.implode(',', array_map('intval', $value)).'}';
    }
    public function getName(): string
    {
        return self::NAME;
    }
    public function requiresSQLCommentHint(AbstractPlatform $platform): bool
    {
        return true;
    }
}
