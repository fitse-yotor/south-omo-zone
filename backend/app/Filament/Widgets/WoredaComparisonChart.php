<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\ReadsDashboardFilters;
use App\Models\Woreda;
use App\Support\Indicators;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;

/** Each woreda's share of the zone total, year to date. Zone staff only; one hue (magnitude), selected woreda highlighted. */
class WoredaComparisonChart extends ChartWidget
{
    use ReadsDashboardFilters;

    protected static ?int $sort = 3;

    protected static ?string $pollingInterval = null;

    protected static ?string $maxHeight = '300px';

    public ?string $filter = 'investment_capital';

    public static function canView(): bool
    {
        return (bool) Auth::user()?->isZoneStaff();
    }

    public function getHeading(): string
    {
        return 'Woredas compared';
    }

    public function getDescription(): ?string
    {
        $d = Indicators::get($this->indicator());

        return "{$d['label']} ({$d['unit']}), year to date · ".Indicators::fiscalYearLabel($this->fiscalYear());
    }

    protected function getFilters(): ?array
    {
        return Indicators::options();
    }

    protected function indicator(): string
    {
        return array_key_exists((string) $this->filter, Indicators::all()) ? $this->filter : 'investment_capital';
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $key = $this->indicator();
        $selected = $this->scopeWoredaId();
        $sums = Indicators::query($this->fiscalYear())
            ->selectRaw("woreda_id, COALESCE(SUM({$key}), 0) AS total")
            ->groupBy('woreda_id')->toBase()->pluck('total', 'woreda_id');

        $rows = Woreda::orderBy('sort')->get(['id', 'name_en'])
            ->map(fn ($w) => ['id' => $w->id, 'name' => $w->name_en, 'total' => round((float) ($sums[$w->id] ?? 0), 2)])
            ->sortByDesc('total')->values();

        $colors = $rows->map(fn ($r) => ! $selected || $r['id'] === $selected ? CumulativeTrendChart::THIS_YEAR : '#b0aea5')->all();

        return [
            'labels' => $rows->pluck('name')->all(),
            'datasets' => [[
                'label' => Indicators::get($key)['label'],
                'data' => $rows->pluck('total')->all(),
                'backgroundColor' => $colors,
                'hoverBackgroundColor' => $colors,
                'borderWidth' => 0,
                'borderRadius' => 4,
                'borderSkipped' => 'start',
                'maxBarThickness' => 22,
            ]],
        ];
    }

    protected function getOptions(): RawJs
    {
        return RawJs::make(<<<'JS'
        {
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x.toLocaleString()}` } },
            },
            scales: {
                x: { beginAtZero: true, border: { display: false }, ticks: { maxTicksLimit: 5, callback: (v) => v.toLocaleString() } },
                y: { grid: { display: false } },
            },
        }
        JS);
    }
}
