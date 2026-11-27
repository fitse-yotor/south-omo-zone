<?php

namespace App\Filament\Widgets;

use App\Filament\Widgets\Concerns\ReadsDashboardFilters;
use App\Support\Indicators;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** Year-to-date total for every indicator, with a monthly sparkline and the change on the same months last year. */
class IndicatorStats extends StatsOverviewWidget
{
    use ReadsDashboardFilters;

    protected static ?int $sort = 1;

    protected static ?string $pollingInterval = null;

    protected function getColumns(): int
    {
        return 3;
    }

    protected function getHeading(): ?string
    {
        $latest = Indicators::latestMonth($this->fiscalYear(), $this->scopeWoredaId());
        $through = $latest ? 'July to '.$latest->format('F Y') : 'no monthly reports yet';

        return $this->scopeName().' · '.Indicators::fiscalYearLabel($this->fiscalYear()).' · '.$through;
    }

    protected function getStats(): array
    {
        $year = $this->fiscalYear();
        $woreda = $this->scopeWoredaId();
        $latest = Indicators::latestMonth($year, $woreda);

        $now = Indicators::totals($year, $woreda);
        // Same months of the previous fiscal year, for a like-for-like comparison.
        $before = $latest ? Indicators::totals($year - 1, $woreda, $latest->subYear()) : [];

        return collect(Indicators::all())->map(function ($d, $key) use ($year, $woreda, $now, $before, $latest) {
            $monthly = collect(Indicators::monthly($key, $year, $woreda));
            $lastIndex = $monthly->filter(fn ($v) => $v !== null)->keys()->last();
            $spark = $lastIndex === null ? [] : $monthly->take($lastIndex + 1)->map(fn ($v) => (float) $v)->all();

            $stat = Stat::make("{$d['label']} ({$d['unit']})", Indicators::format($now[$key], $key))
                ->chart(count($spark) > 1 ? $spark : null)
                ->chartColor('primary');

            $prev = $before[$key] ?? 0;
            if (! $latest) {
                return $stat->description('No monthly reports in this fiscal year');
            }
            if ($prev <= 0) {
                return $stat->description('No figures for the same months last year')->descriptionColor('gray');
            }

            $change = ($now[$key] - $prev) / $prev * 100;
            $text = sprintf('%s%s%% on the same months last year', $change >= 0 ? '+' : '−', number_format(abs($change), $change !== 0.0 && abs($change) < 10 ? 1 : 0));

            return $stat->description($text)
                ->descriptionIcon($change >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->descriptionColor($change >= 0 ? 'success' : 'danger');
        })->values()->all();
    }
}
