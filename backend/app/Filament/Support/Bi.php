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

    /** Built-in photo picker plus an optional upload (with its credit) that replaces it. */
    public static function photo(string $directory, bool $required = false): Section
    {
        $builtin = Select::make('image')->label('Built-in photo')->options(self::builtinPhotos())->searchable()
            ->helperText('Licensed photos that ship with the site. Their credits show automatically.');
        if ($required) {
            $builtin->requiredWithout('photo')->validationMessages(['required_without' => 'Choose a built-in photo or upload one.']);
        }

        return Section::make('Photo')->schema([
            $builtin,
            FileUpload::make('photo')->label('Or upload a new photo (replaces the built-in one)')->disk('uploads')->directory($directory)
                ->image()->imageResizeMode('cover')->imageResizeTargetWidth('1920')->maxSize(6144)
                ->helperText('JPG or PNG, landscape, up to 6 MB. Only upload photos the zone owns or may use.'),
            TextInput::make('photo_credit')->label('Credit for the uploaded photo')->maxLength(255)
                ->placeholder('e.g. South Omo Zone Culture & Tourism Department')->columnSpanFull(),
        ])->columns(2)->collapsible();
    }

    public static function builtinPhotos(): array
    {
        static $opts;
        if ($opts === null) {
            $opts = \App\Models\PhotoCredit::orderBy('photo_id')->get()
                ->mapWithKeys(fn ($p) => [$p->photo_id => ucfirst(str_replace('-', ' ', $p->photo_id)).' — © '.$p->author])->all();
            if (! $opts) { // before the credits are seeded
                $data = json_decode(@file_get_contents(database_path('data/content.json')) ?: '{}', true);
                $opts = collect($data['photos'] ?? [])->mapWithKeys(fn ($p) => [$p['id'] => ucfirst(str_replace('-', ' ', $p['id'])).' — © '.$p['credit']])->all();
            }
        }

        return $opts;
    }

    /** Towns on the tourism map, for route pickers. */
    public static function stopOptions(): array
    {
        return \App\Models\RouteStop::orderBy('sort')->pluck('name_en', 'key')->all();
    }

    /** Validation rule: consecutive towns must be joined by a road on the map. */
    public static function routeRule(): \Closure
    {
        return fn (): \Closure => function (string $attribute, $value, \Closure $fail) {
            if ($error = \App\Support\MapData::routeError(array_values((array) $value))) {
                $fail($error);
            }
        };
    }

    public static function canEditContent(): bool
    {
        return (bool) Auth::user()?->canEditContent();
    }

    public static function isAdmin(): bool
    {
        return (bool) Auth::user()?->isAdmin();
    }

    /** True for admin, editor and notices — but NOT for woreda accounts. */
    public static function isZoneStaff(): bool
    {
        return (bool) Auth::user()?->isZoneStaff();
    }
}
