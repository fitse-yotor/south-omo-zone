<?php

namespace App\Filament\Support;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Illuminate\Support\Facades\Auth;

/**
 * Form helpers for bilingual content: each field becomes "<name>_en" and "<name>_am",
 * shown in an English tab and an Amharic tab. English is required; Amharic falls back to English if empty.
 */
class Bi
{
    /**
     * @param  array<string, array{0:string,1?:string,2?:array}>  $fields  name => [label, type, options]
     *                                                                     type: text | textarea | lines | paragraphs
     */
    public static function tabs(array $fields): Tabs
    {
        return Tabs::make('Language')->tabs([
            Tab::make('English')->schema(self::fields($fields, 'en')),
            Tab::make('አማርኛ (Amharic)')->schema(self::fields($fields, 'am')),
        ])->columnSpanFull();
    }

    protected static function fields(array $fields, string $lang): array
    {
        $out = [];
        foreach ($fields as $name => $cfg) {
            [$label, $type, $opt] = $cfg + [1 => 'text', 2 => []];
            $optional = $opt['optional'] ?? false;
            $f = match ($type) {
                'textarea' => Textarea::make("{$name}_{$lang}")->rows($opt['rows'] ?? 4),
                'lines' => Textarea::make("{$name}_{$lang}")->rows($opt['rows'] ?? 5)->helperText('One item per line.'),
                'paragraphs' => Textarea::make("{$name}_{$lang}")->rows($opt['rows'] ?? 14)->helperText('Leave an empty line between paragraphs.'),
                default => TextInput::make("{$name}_{$lang}")->maxLength(255),
            };
            $out[] = $f->label($label)->required($lang === 'en' && ! $optional);
        }

        return $out;
    }

    /** Built-in photo picker plus an optional upload that replaces it. */
    public static function photo(string $directory): Section
    {
        return Section::make('Photo')->schema([
            Select::make('image')->label('Built-in photo')->options(self::builtinPhotos())->searchable()
                ->helperText('Licensed photos that ship with the site. Their credits show automatically.'),
            FileUpload::make('photo')->label('Upload a new photo (replaces the built-in one)')->disk('uploads')->directory($directory)
                ->image()->imageResizeMode('cover')->imageResizeTargetWidth('1920')->maxSize(6144)
                ->helperText('JPG or PNG, landscape, up to 6 MB. Only upload photos the zone owns or may use.'),
        ])->columns(2)->collapsible();
    }

    public static function builtinPhotos(): array
    {
        static $opts;
        if ($opts === null) {
            $data = json_decode(@file_get_contents(database_path('data/content.json')) ?: '{}', true);
            $opts = collect($data['photos'] ?? [])->mapWithKeys(fn ($p) => [$p['id'] => ucfirst(str_replace('-', ' ', $p['id'])).' — © '.$p['credit']])->all();
        }

        return $opts;
    }

    public static function canEditContent(): bool
    {
        return (bool) Auth::user()?->canEditContent();
    }

    public static function isAdmin(): bool
    {
        return (bool) Auth::user()?->isAdmin();
    }
}
