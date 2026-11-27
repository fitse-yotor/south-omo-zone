<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\ReadsDashboardFilters;
use App\Support\Indicators;
use Filament\Support\RawJs;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;

/**
 * Running total through the fiscal year, this year against last year (same scope).
 * Colours were checked for colour-blind separation and contrast on light and dark surfaces:
 * this year #c15f3c (clay), last year #3d7cc4 (blue, dashed as a second cue).
 */
class CumulativeTrendChart extends ChartWidget
{
    use ReadsDashboardFilters;

    public const THIS_YEAR = '#c15f3c';

    public const LAST_YEAR = '#3d7cc4';

    protected static ?int $sort = 2;

    protected static ?string $pollingInterval = null;

    protected static ?string $maxHeight = '300px';

    public ?string $filter = 'investment_capital';

    public function getColumnSpan(): int|string|array
    {
        return Auth::user()?->isWoredaUser() ? 'full' : 1;
    }

    public function getHeading(): string
    {
        return 'Cumulative progress';
    }

    public function getDescription(): ?string
    {
        $d = Indicators::get($this->indicator());

        return "{$d['label']} ({$d['unit']}), running total from July · {$this->scopeName()}";
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
        return 'line';
    }

    protected function getData(): array
    {
        $key = $this->indicator();
        $year = $this->fiscalYear();
        $woreda = $this->scopeWoredaId();
        $line = fn (string $color, bool $dashed) => [
            'borderColor' => $color, 'backgroundColor' => $color, 'pointBackgroundColor' => $color,
            'borderWidth' => 2, 'pointRadius' => 3, 'pointHoverRadius' => 5, 'tension' => 0.25,
            'spanGaps' => false, 'borderDash' => $dashed ? [6, 4] : [],
        ];

        return [
            'labels' => Indicators::months($year)->map(fn ($m) => $m->format('M'))->all(),
            'datasets' => [
                ['label' => Indicators::fiscalYearLabel($year), 'data' => Indicators::cumulative($key, $year, $woreda)] + $line(self::THIS_YEAR, false),
                ['label' => Indicators::fiscalYearLabel($year - 1), 'data' => Indicators::cumulative($key, $year - 1, $woreda)] + $line(self::LAST_YEAR, true),
            ],
        ];
    }

    protected function getOptions(): RawJs
    {
        return RawJs::make(<<<'JS'
        {
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ctx.parsed.y === null ? null : ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
                    },
                },
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, border: { display: false }, ticks: { maxTicksLimit: 5, callback: (v) => v.toLocaleString() } },
            },
        }
        JS);
    }
}
