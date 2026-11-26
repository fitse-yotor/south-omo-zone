<?php

namespace App\Filament\Support;

use Filament\AvatarProviders\Contracts\AvatarProvider;
use Filament\Facades\Filament;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

/** Initials avatar drawn locally, so staff names are never sent to an outside avatar service. */
class InitialsAvatar implements AvatarProvider
{
    public function get(Model|Authenticatable $record): string
    {
        $name = Filament::getNameForDefaultAvatar($record);
        $initials = collect(preg_split('/\s+/u', trim($name)))->filter()->take(2)->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))->join('');
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2a55bd"/>'
            .'<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" fill="#fff">'
            .htmlspecialchars($initials ?: '?', ENT_XML1).'</text></svg>';

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }
}
