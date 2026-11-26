<?php

namespace App\Filament\Widgets;

use App\Filament\Support\Bi;
use App\Support\LaunchChecklist as Checklist;
use Filament\Widgets\Widget;

class LaunchChecklist extends Widget
{
    protected static string $view = 'filament.widgets.launch-checklist';

    protected static ?int $sort = -10;

    protected int|string|array $columnSpan = 'full';

    public bool $showDone = false;

    public static function canView(): bool
    {
        return Bi::canEditContent();
    }

    protected function getViewData(): array
    {
        $items = Checklist::items();
        return ['items' => $items, 'doneCount' => collect($items)->where('done', true)->count(), 'total' => count($items)];
    }
}
