<?php

namespace App\Support;

use App\Models\RouteStop;

/**
 * Knows which roads the tourism map can draw. Road shapes come from OpenStreetMap
 * (src/data/routes.json in the website), exported to database/data/content.json as "legs".
 * Journeys and itineraries may only use these roads, otherwise the map could not draw them.
 */
class MapData
{
    public static function legs(): array
    {
        static $legs;

        return $legs ??= json_decode(@file_get_contents(database_path('data/content.json')) ?: '{}', true)['legs'] ?? [];
    }

    public static function hasLeg(string $a, string $b): bool
    {
        return in_array("$a-$b", self::legs(), true) || in_array("$b-$a", self::legs(), true);
    }

    /** Returns an error message, or null when every consecutive pair of stops is a road on the map. */
    public static function routeError(array $stops): ?string
    {
        // Form state holds items as ['stop' => 'jinka'] while validating; stored data is a flat list.
        $stops = array_values(array_filter(array_map(fn ($s) => is_array($s) ? ($s['stop'] ?? reset($s)) : $s, $stops)));
        if (count($stops) < 2) {
            return 'Choose at least two towns.';
        }
        $names = RouteStop::pluck('name_en', 'key');
        for ($i = 1; $i < count($stops); $i++) {
            [$a, $b] = [$stops[$i - 1], $stops[$i]];
            if (! self::hasLeg($a, $b)) {
                return sprintf('There is no road on the map between %s and %s. Add a town in between (roads on the map: %s).',
                    $names[$a] ?? $a, $names[$b] ?? $b,
                    collect(self::legs())->map(fn ($l) => collect(explode('-', $l))->map(fn ($k) => $names[$k] ?? $k)->join('–'))->join(', '));
            }
        }

        return null;
    }
}
