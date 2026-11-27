<?php

namespace App\Support;

use App\Models\WoredaReport;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * The figures woredas report every month, and the rules for adding them up.
 *
 * Counting rule (so nothing is counted twice): only MONTHLY reports with a month set, and not
 * sent back for revision, count toward the dashboard. Quarterly and annual reports stay narrative.
 *
 * Fiscal year: the Ethiopian budget year runs from Hamle 1 (about 8 July) to Sene 30. Reports are
 * filed per Gregorian month, so a fiscal year here is July to June: "FY 2026/27" = EFY 2019.
 */
class Indicators
{
    /** key => [label, unit, sector, decimals] — keys are columns on woreda_reports. */
    public const DEFINITIONS = [
        'investment_projects' => ['New investment projects licensed', 'projects', 'Investment', 0],
        'investment_capital' => ['Investment capital registered', 'ETB million', 'Investment', 1],
        'jobs_created' => ['Jobs created', 'people', 'Investment', 0],
        'cultivated_ha' => ['Land cultivated', 'ha', 'Agriculture', 0],
        'crop_production_qt' => ['Crop production', 'quintals', 'Agriculture', 0],
        'livestock_vaccinated' => ['Livestock vaccinated', 'head', 'Agriculture', 0],
        'tourists' => ['Tourist visitors', 'visitors', 'Tourism', 0],
        'tourism_revenue' => ['Tourism revenue', 'ETB thousand', 'Tourism', 1],
        'revenue_collected' => ['Government revenue collected', 'ETB million', 'Revenue', 1],
    ];

    /** @return array<string, array{label:string, unit:string, sector:string, decimals:int}> */
    public static function all(): array
    {
        return collect(self::DEFINITIONS)->map(fn ($d) => ['label' => $d[0], 'unit' => $d[1], 'sector' => $d[2], 'decimals' => $d[3]])->all();
    }

    public static function get(string $key): array
    {
        return self::all()[$key] ?? self::all()['investment_capital'];
    }

    /** key => "Label (unit)", for selects. */
    public static function options(): array
    {
        return collect(self::all())->map(fn ($d) => "{$d['label']} ({$d['unit']})")->all();
    }

    /** sector => [key, …] in display order. */
    public static function bySector(): array
    {
        return collect(self::all())->groupBy('sector', preserveKeys: true)->map(fn ($g) => $g->keys()->all())->all();
    }

    public static function format(float|int|null $value, string $key, bool $withUnit = false): string
    {
        $d = self::get($key);
        $text = number_format((float) $value, $d['decimals']);

        return $withUnit ? "{$text} {$d['unit']}" : $text;
    }

    // ── Fiscal years ─────────────────────────────────────────────

    /** First day (1 July) of the fiscal year that contains $date. */
    public static function fiscalYearStart(?\DateTimeInterface $date = null): CarbonImmutable
    {
        $d = CarbonImmutable::instance($date ?? now())->startOfMonth();

        return $d->month >= 7 ? $d->setDate($d->year, 7, 1) : $d->setDate($d->year - 1, 7, 1);
    }

    public static function fiscalYearLabel(int $startYear): string
    {
        return sprintf('FY %d/%02d (EFY %d)', $startYear, ($startYear + 1) % 100, $startYear - 7);
    }

    /** startYear => label, newest first: every fiscal year with figures, plus the current one. */
    public static function fiscalYearOptions(): array
    {
        $current = self::fiscalYearStart()->year;
        $range = WoredaReport::query()->countable()->selectRaw('MIN(period_start) AS lo, MAX(period_start) AS hi')->first();
        $from = $range?->lo ? self::fiscalYearStart(CarbonImmutable::parse($range->lo))->year : $current;
        $to = max($current, $range?->hi ? self::fiscalYearStart(CarbonImmutable::parse($range->hi))->year : $current);

        return collect(range($to, $from))->mapWithKeys(fn ($y) => [$y => self::fiscalYearLabel($y)])->all();
    }

    /** The 12 month starts of a fiscal year (July … June). */
    public static function months(int $startYear): Collection
    {
        $start = CarbonImmutable::create($startYear, 7, 1);

        return collect(range(0, 11))->map(fn ($i) => $start->addMonths($i));
    }

    // ── Aggregation ──────────────────────────────────────────────

    /** Countable monthly reports in a fiscal year, optionally for one woreda. */
    public static function query(int $startYear, ?int $woredaId = null): Builder
    {
        return self::inFiscalYear(WoredaReport::query()->countable(), $startYear)
            ->when($woredaId, fn ($q) => $q->where('woreda_id', $woredaId));
    }

    /**
     * Limit a report query to one fiscal year. Half-open range on purpose: SQLite keeps dates as
     * "2026-10-01 00:00:00", so "<= 2026-06-30" style bounds would silently drop rows.
     */
    public static function inFiscalYear(Builder $query, int $startYear): Builder
    {
        $start = CarbonImmutable::create($startYear, 7, 1);

        return $query->where('period_start', '>=', $start->toDateString())
            ->where('period_start', '<', $start->addYear()->toDateString());
    }

    /** key => total for the fiscal year (optionally only up to and including month $throughMonth). */
    public static function totals(int $startYear, ?int $woredaId = null, ?CarbonImmutable $throughMonth = null): array
    {
        $select = collect(array_keys(self::all()))->map(fn ($k) => "COALESCE(SUM({$k}), 0) AS {$k}")->implode(', ');
        $row = self::query($startYear, $woredaId)
            ->when($throughMonth, fn ($q) => $q->where('period_start', '<', $throughMonth->startOfMonth()->addMonth()->toDateString()))
            ->selectRaw($select)->first();

        return collect(array_keys(self::all()))->mapWithKeys(fn ($k) => [$k => (float) ($row?->{$k} ?? 0)])->all();
    }

    /**
     * Month-by-month sums for one indicator: 12 values (July … June), null for months with no reports yet.
     *
     * @return array<int, float|null>
     */
    public static function monthly(string $key, int $startYear, ?int $woredaId = null): array
    {
        abort_unless(array_key_exists($key, self::all()), 404);

        $sums = self::query($startYear, $woredaId)
            ->selectRaw("period_start, SUM({$key}) AS total")
            ->groupBy('period_start')
            ->toBase()
            ->pluck('total', 'period_start')
            ->mapWithKeys(fn ($v, $d) => [substr((string) $d, 0, 7) => (float) $v]);

        return self::months($startYear)->map(fn ($m) => $sums[$m->format('Y-m')] ?? null)->all();
    }

    /** Running total of monthly(): null after the last month that has reports, so lines stop there. */
    public static function cumulative(string $key, int $startYear, ?int $woredaId = null): array
    {
        $monthly = self::monthly($key, $startYear, $woredaId);
        $last = collect($monthly)->filter(fn ($v) => $v !== null)->keys()->last();
        $running = 0.0;

        return collect($monthly)->map(function ($v, $i) use (&$running, $last) {
            if ($last === null || $i > $last) {
                return null;
            }
            $running += (float) $v;

            return round($running, 2);
        })->all();
    }

    /** Latest month (start) that has any countable report in the fiscal year, or null. */
    public static function latestMonth(int $startYear, ?int $woredaId = null): ?CarbonImmutable
    {
        $max = self::query($startYear, $woredaId)->max('period_start');

        return $max ? CarbonImmutable::parse($max)->startOfMonth() : null;
    }
}
