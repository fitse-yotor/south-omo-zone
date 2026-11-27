<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\WoredaReportResource;
use App\Filament\Widgets\Concerns\ReadsDashboardFilters;
use App\Models\Woreda;
use App\Support\Indicators;
use Carbon\CarbonImmutable;
use App\Support\PortalNotifier;
use Filament\Notifications\Notification;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Illuminate\Support\Facades\Cache;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Support\Facades\Auth;

/** One row per woreda: reporting discipline, year-to-date figures and plan progress. Zone staff only. */
class WoredaScorecard extends TableWidget
{
    use ReadsDashboardFilters;

    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    /** Figures shown as columns (the stat tiles above have all of them). */
    protected const COLUMNS = ['investment_capital', 'jobs_created', 'cultivated_ha', 'tourists', 'revenue_collected'];

    public static function canView(): bool
    {
        return (bool) Auth::user()?->isZoneStaff();
    }

    /** The latest month every woreda should have reported by now (last month), capped to the fiscal year. */
    protected function expectedMonth(): ?CarbonImmutable
    {
        $start = CarbonImmutable::create($this->fiscalYear(), 7, 1);
        $lastMonth = CarbonImmutable::now()->startOfMonth()->subMonth();

        return $lastMonth->lessThan($start) ? null : $lastMonth->min($start->addMonths(11));
    }

    protected function heading(): string
    {
        $expected = $this->expectedMonth();
        if (! $expected) {
            return 'Woreda scorecard';
        }
        $months = (int) CarbonImmutable::create($this->fiscalYear(), 7, 1)->diffInMonths($expected) + 1;
        $due = Woreda::count() * $months;
        // Distinct woreda-months, so a month reported twice still counts once.
        $received = Indicators::query($this->fiscalYear())->where('period_start', '<', $expected->addMonth()->toDateString())
            ->toBase()->select('woreda_id', 'period_start')->distinct()->get()->count();
        $rate = $due ? round($received / $due * 100) : 0;

        return "Woreda scorecard · {$received} of {$due} monthly reports received to {$expected->format('F Y')} ({$rate}%)";
    }

    public function table(Table $table): Table
    {
        $year = $this->fiscalYear();
        $inYear = fn ($q) => Indicators::inFiscalYear($q->countable(), $year);
        $expected = $this->expectedMonth();

        $query = Woreda::query()
            ->withCount(['reports as reports_ytd' => $inYear])
            ->withMax(['reports as latest_month' => $inYear], 'period_start')
            ->withAvg(['planProgress as plan_progress' => fn ($q) => $q->whereHas('task.plan', fn ($p) => $p->where('status', 'active'))], 'progress');
        foreach (self::COLUMNS as $key) {
            $query->withSum(["reports as {$key}_ytd" => $inYear], $key);
        }

        $figureColumns = collect(self::COLUMNS)->map(fn ($key) => TextColumn::make("{$key}_ytd")
            ->label(Indicators::get($key)['label'])
            ->description(Indicators::get($key)['unit'], position: 'above')
            ->formatStateUsing(fn ($state) => Indicators::format($state, $key))
            ->default(0)
            ->alignEnd()
            ->sortable())->all();

        return $table
            ->heading($this->heading())
            ->query($query)
            ->defaultSort('sort')
            ->paginated(false)
            ->recordUrl(fn (Woreda $record) => WoredaReportResource::getUrl('index', ['tableFilters' => ['woreda_id' => ['value' => $record->id]]]))
            ->columns([
                TextColumn::make('name_en')->label('Woreda')->weight('semibold')->sortable(),
                TextColumn::make('reports_ytd')->label('Reports')->alignEnd()->sortable(),
                TextColumn::make('latest_month')
                    ->label('Reported up to')
                    ->formatStateUsing(fn ($state) => $state ? CarbonImmutable::parse($state)->format('M Y') : 'None yet')
                    ->default(null)->placeholder('None yet')
                    ->badge()
                    ->icon(fn ($state) => $this->lag($state, $expected) === 0 ? 'heroicon-m-check-circle' : 'heroicon-m-clock')
                    ->color(fn ($state) => match (true) {
                        $expected === null => 'gray',
                        $this->lag($state, $expected) === 0 => 'success',
                        $this->lag($state, $expected) === 1 => 'warning',
                        default => 'danger',
                    })
                    ->tooltip(fn ($state) => $expected ? match ($lag = $this->lag($state, $expected)) {
                        0 => 'Up to date',
                        default => "{$lag} month(s) behind",
                    } : null),
                ...$figureColumns,
                TextColumn::make('plan_progress')
                    ->label('Active plans')
                    ->description('avg. progress', position: 'above')
                    ->formatStateUsing(fn ($state) => $state === null ? '—' : round((float) $state).'%')
                    ->default(null)->placeholder('—')
                    ->alignEnd()
                    ->sortable(),
            ])
            ->actions([
                Action::make('remind')
                    ->label(fn (Woreda $record) => $this->remindedToday($record->id) ? 'Reminded today' : 'Remind')
                    ->icon('heroicon-m-bell-alert')
                    ->color('warning')
                    ->size('sm')
                    ->visible(fn (Woreda $record) => $this->canRemind() && $this->lag($record->latest_month, $expected) > 0)
                    ->disabled(fn (Woreda $record) => $this->remindedToday($record->id))
                    ->requiresConfirmation()
                    ->modalHeading(fn (Woreda $record) => "Remind {$record->name_en}?")
                    ->modalDescription(fn (Woreda $record) => "Its accounts get a notification that the {$this->missingMonth($record->latest_month)} report is due.")
                    ->action(fn (Woreda $record) => $this->remind(collect([$record]))),
            ])
            ->headerActions([
                Action::make('remind_all')
                    ->label('Remind all late woredas')
                    ->icon('heroicon-m-bell-alert')
                    ->color('warning')
                    ->outlined()
                    ->visible(fn () => $this->canRemind())
                    ->requiresConfirmation()
                    ->modalDescription('Each woreda behind on its monthly report gets a notification (at most one reminder per woreda per day).')
                    ->action(fn () => $this->remind((clone $query)->get()->filter(fn ($w) => $this->lag($w->latest_month, $expected) > 0))),
            ]);
    }

    /** Reminders only make sense for the running fiscal year, and only reviewers send them. */
    protected function canRemind(): bool
    {
        return (bool) Auth::user()?->canEditContent()
            && $this->fiscalYear() === Indicators::fiscalYearStart()->year
            && $this->expectedMonth() !== null;
    }

    /** The oldest month the woreda still owes. */
    protected function missingMonth(?string $latest): string
    {
        $month = $latest ? CarbonImmutable::parse($latest)->startOfMonth()->addMonth() : CarbonImmutable::create($this->fiscalYear(), 7, 1);

        return $month->format('F Y');
    }

    protected function remindedToday(int $woredaId): bool
    {
        return Cache::has("report-reminder:{$woredaId}:".now()->toDateString());
    }

    protected function remind($woredas): void
    {
        $sent = 0;
        $people = 0;
        foreach ($woredas as $woreda) {
            if ($this->remindedToday($woreda->id)) {
                continue;
            }
            $people += PortalNotifier::reportReminder($woreda->id, $this->missingMonth($woreda->latest_month));
            Cache::put("report-reminder:{$woreda->id}:".now()->toDateString(), true, now()->endOfDay());
            $sent++;
        }

        Notification::make()
            ->title($sent ? "Reminder sent to {$sent} woreda(s)" : 'Nothing to send')
            ->body($sent && ! $people ? 'Those woredas have no active accounts yet, so nobody received it. Create woreda accounts under Settings → Staff & Woreda accounts.' : ($sent ? null : 'Every late woreda was already reminded today.'))
            ->color($sent && $people ? 'success' : 'warning')
            ->send();
    }

    /** Months between the latest report and the expected month (99 = never reported). */
    protected function lag(?string $latest, ?CarbonImmutable $expected): int
    {
        if (! $expected) {
            return 0;
        }
        if (! $latest) {
            return 99;
        }

        return max(0, (int) CarbonImmutable::parse($latest)->startOfMonth()->diffInMonths($expected));
    }
}
