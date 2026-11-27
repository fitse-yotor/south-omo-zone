<?php

namespace Database\Seeders;

use App\Models\PlanTask;
use App\Models\PlanTaskProgress;
use App\Models\User;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Models\ZonePlan;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * SAMPLE monthly woreda reports with figures, for trying out the dashboard. Not real data.
 *   php artisan db:seed --class=WoredaReportSeeder
 *
 * - July 2025 to October 2026 for each woreda (last fiscal year in full, this one so far)
 * - Figures follow each woreda's character (pastoral lowlands, sugar estates, highland farming, Turmi tourism)
 *   and the seasons (rains, harvests, the December–February tourist peak)
 * - A few realistic gaps: Nyangatom two months behind, Bako Gazer one, one Male report sent back for revision
 * - One active zone plan with progress per woreda
 * Safe to run again: months that already have a monthly report are skipped. Not called by DatabaseSeeder,
 * so it never reaches a live site by accident.
 */
class WoredaReportSeeder extends Seeder
{
    /** Typical month in FY 2025/26: [projects, jobs, cultivated ha, crop qt, livestock, tourists, revenue ETB m, capital per project ETB m]. */
    private const PROFILES = [
        'Hamer' => [0.6, 45, 300, 2500, 9000, 950, 2.4, 25],
        'Bena Tsemay' => [0.8, 60, 900, 9000, 5000, 520, 3.1, 30],
        'Dasenech' => [0.5, 40, 700, 6000, 11000, 300, 2.0, 22],
        'Nyangatom' => [0.2, 15, 250, 1800, 9000, 60, 0.8, 15],
        'Selamago' => [1.2, 140, 1200, 7000, 4500, 420, 2.6, 70],
        'Kuraz' => [1.4, 180, 1500, 8000, 4000, 90, 2.9, 85],
        'Male' => [0.7, 55, 1100, 14000, 3000, 80, 3.4, 28],
        'Bako Gazer' => [0.6, 50, 1000, 12000, 3500, 110, 3.0, 26],
    ];

    /** Month (1-12) multipliers. */
    private const PLANTING = [1 => .3, .4, 1.3, 1.5, 1.4, .8, 1.3, 1.4, 1.1, .5, .3, .3];

    private const HARVEST = [1 => 1.2, .6, .3, .3, .4, 1.1, 1.0, .5, .4, 1.4, 1.7, 1.5];

    private const VACCINATION = [1 => .7, .8, 1.4, 1.5, .9, .7, .7, .8, .9, 1.5, 1.4, .8];

    private const TOURISM = [1 => 1.6, 1.5, 1.2, .45, .45, .7, .9, .9, .9, 1.0, 1.2, 1.6];

    private const REVENUE = [1 => 1.2, .9, .9, .9, 1.0, 1.4, .8, .9, 1.0, 1.0, 1.0, 1.0];

    /** woreda => months (Y-m) left out / sent back, to show the scorecard's warnings. */
    private const MISSING = ['Nyangatom' => ['2026-09', '2026-10'], 'Bako Gazer' => ['2026-10']];

    private const SENT_BACK = ['Male' => '2026-09'];

    public function run(): void
    {
        $admin = User::where('role', 'admin')->where('is_active', true)->orderBy('id')->first();
        if (! $admin) {
            $this->command?->warn('No administrator yet. Run php artisan portal:admin first.');

            return;
        }

        $woredas = Woreda::orderBy('sort')->get();
        if ($woredas->isEmpty()) {
            $this->command?->warn('No woredas found. Run php artisan db:seed first.');

            return;
        }

        mt_srand(20261127); // same sample every run
        $created = 0;
        $months = collect(range(0, 15))->map(fn ($i) => CarbonImmutable::create(2025, 7, 1)->addMonths($i));

        foreach ($woredas as $woreda) {
            $profile = self::PROFILES[$woreda->name_en] ?? [0.6, 50, 800, 6000, 5000, 150, 2.0, 25];
            $author = User::where('role', 'woreda')->where('woreda_id', $woreda->id)->orderBy('id')->first() ?? $admin;

            foreach ($months as $month) {
                $key = $month->format('Y-m');
                $figures = $this->figures($profile, $month); // drawn even when skipped, so every run gives the same numbers
                if (in_array($key, self::MISSING[$woreda->name_en] ?? [], true)) {
                    continue;
                }
                $exists = WoredaReport::where('woreda_id', $woreda->id)->where('period_type', 'monthly')
                    ->where('period_start', '>=', $month->toDateString())
                    ->where('period_start', '<', $month->addMonth()->toDateString())->exists();
                if ($exists) {
                    continue;
                }

                $submitted = $month->addMonth()->addDays(4 + mt_rand(0, 6))->setTime(9 + mt_rand(0, 7), mt_rand(0, 59));
                $status = $this->status($woreda->name_en, $month);
                $reviewed = $status === 'submitted' ? null : $submitted->addDays(3 + mt_rand(0, 8));

                $report = new WoredaReport([
                    'woreda_id' => $woreda->id,
                    'submitted_by' => $author->id,
                    'title' => "{$woreda->name_en} monthly report — {$month->format('F Y')}",
                    'period' => $month->format('F Y'),
                    'period_type' => 'monthly',
                    'period_start' => $month,
                    'status' => $status,
                    'reviewed_at' => $reviewed,
                    'reviewed_by' => $reviewed ? $admin->id : null,
                    'zone_feedback' => $this->feedback($status, $woreda->name_en),
                    ...$this->narrative($woreda->name_en, $month, $figures),
                    ...$figures,
                ]);
                $report->created_at = $submitted;
                $report->updated_at = $reviewed ?? $submitted;
                $report->save();
                $created++;
            }
        }

        $this->command?->info("Sample woreda reports created: {$created}");
        $this->seedPlan($admin, $woredas);
        $this->seedConversation($admin, $woredas);
    }

    /** A discussion on the sent-back Male report and one circular, so those screens have something to show. */
    private function seedConversation(User $admin, $woredas): void
    {
        $male = $woredas->firstWhere('name_en', 'Male');
        $sentBack = $male ? WoredaReport::where('woreda_id', $male->id)->where('status', 'rejected')->first() : null;
        if ($sentBack && $sentBack->comments()->doesntExist()) {
            $woredaUser = User::where('role', 'woreda')->where('woreda_id', $male->id)->first() ?? $admin;
            $at = CarbonImmutable::parse($sentBack->reviewed_at ?? now());
            foreach ([
                [$admin, $sentBack->zone_feedback, 0],
                [$woredaUser, 'Understood. The agriculture office is re-checking the kebele harvest figures; we will send the corrected report this week.', 26],
                [$admin, 'Thank you. Please also attach the kebele summary sheet when you resubmit.', 30],
            ] as [$user, $body, $hours]) {
                $c = $sentBack->comments()->make(['user_id' => $user->id, 'body' => $body]);
                $c->created_at = $c->updated_at = $at->addHours($hours);
                $c->save();
            }
        }

        $circular = \App\Models\Circular::firstOrCreate(['title' => 'Submit monthly reports by the 10th of each month (sample)'], [
            'reference_no' => 'SOZ/PLN/0412/19',
            'body' => "To all woreda administration offices,\n\nFrom this fiscal year, monthly reports with figures must reach the zone by the 10th of the following month, through this portal. Reports received later cannot be included in the zone's report to the region.\n\nPlease name a reporting focal person and acknowledge this circular.",
            'priority' => 'normal',
            'requires_acknowledgement' => true,
            'respond_by' => '2026-08-15',
            'created_by' => $admin->id,
        ]);
        if ($circular->wasRecentlyCreated) {
            $circular->created_at = CarbonImmutable::create(2026, 8, 3, 10);
            $circular->save();
            foreach ($woredas as $i => $woreda) {
                $late = array_key_exists($woreda->name_en, self::MISSING);
                $circular->woredas()->attach($woreda->id, [
                    'read_at' => $late && $i % 2 ? null : CarbonImmutable::create(2026, 8, 4 + $i, 9),
                    'acknowledged_at' => $late ? null : CarbonImmutable::create(2026, 8, 5 + $i, 11),
                    'response' => $late ? null : "Focal person named for {$woreda->name_en}.",
                ]);
            }
            $this->command?->info('Sample circular created.');
        }
    }

    private function figures(array $p, CarbonImmutable $month): array
    {
        [$projects, $jobs, $ha, $qt, $livestock, $tourists, $revenue, $capitalPerProject] = $p;
        $m = $month->month;
        $growth = $month->greaterThanOrEqualTo(CarbonImmutable::create(2026, 7, 1)) ? 1.12 : 1.0; // this year runs ahead
        $noise = fn (float $spread = 0.15) => 1 + (mt_rand(-1000, 1000) / 1000) * $spread;

        $newProjects = (int) floor($projects * $growth + mt_rand(0, 999) / 1000);
        $capital = $newProjects * $capitalPerProject * $noise(0.35);

        return [
            'investment_projects' => $newProjects,
            'investment_capital' => round($capital, 1),
            'jobs_created' => (int) round($jobs * $growth * $noise(0.3) + $newProjects * 12),
            'cultivated_ha' => (int) round($ha * self::PLANTING[$m] * $growth * $noise()),
            'crop_production_qt' => (int) round($qt * self::HARVEST[$m] * $growth * $noise()),
            'livestock_vaccinated' => (int) round($livestock * self::VACCINATION[$m] * $noise(0.2)),
            'tourists' => $visitors = (int) round($tourists * self::TOURISM[$m] * $growth * $noise()),
            'tourism_revenue' => round($visitors * (0.55 + mt_rand(0, 250) / 1000), 1),
            'revenue_collected' => round($revenue * self::REVENUE[$m] * $growth * $noise(0.1), 1),
        ];
    }

    private function status(string $woreda, CarbonImmutable $month): string
    {
        if ((self::SENT_BACK[$woreda] ?? null) === $month->format('Y-m')) {
            return 'rejected';
        }

        return match (true) {
            $month->lessThan(CarbonImmutable::create(2026, 9, 1)) => 'approved',
            $month->month === 9 => mt_rand(0, 1) ? 'approved' : 'reviewed',
            default => 'submitted', // October 2026: waiting for the zone
        };
    }

    private function feedback(string $status, string $woreda): ?string
    {
        return match ($status) {
            'approved' => 'Received and checked by the zone planning office. Thank you.',
            'reviewed' => 'Under review by the sector offices.',
            'rejected' => "The crop production figure does not match the {$woreda} agriculture office's harvest assessment. Please check it with the office and send the report again.",
            default => null,
        };
    }

    /** Short narrative that agrees with the figures. */
    private function narrative(string $woreda, CarbonImmutable $month, array $f): array
    {
        $tourismPeak = in_array($month->month, [12, 1, 2], true);
        $rainy = in_array($month->month, [4, 5], true);
        $challenges = [
            'Hamer' => 'Fuel shortages in Turmi slowed vaccination teams; some lodges report water supply problems.',
            'Bena Tsemay' => 'Late inputs (seed and fertiliser) for cotton and sorghum farmers around Key Afer.',
            'Dasenech' => 'Flooding risk along the Omo delta; cross-border livestock movement complicates vaccination counts.',
            'Nyangatom' => 'Long distances and poor mobile coverage delay data collection from kebeles.',
            'Selamago' => 'Access roads near Hana Mursi need maintenance before the next tourist season.',
            'Kuraz' => 'Outgrowers need clearer land agreements with the sugar estate; housing for new workers is short.',
            'Male' => 'Crop pests in the highland kebeles; extension staff are stretched.',
            'Bako Gazer' => 'Feeder road to the highland markets is damaged; farmers struggle to bring produce to market.',
        ];

        return [
            'summary' => "{$woreda} woreda office report for {$month->format('F Y')}. "
                .($tourismPeak ? 'Peak tourist season, with visitor numbers well above the yearly average. ' : '')
                .($rainy ? 'Rains reduced road access and visitor numbers. ' : '')
                .'Figures below were compiled from the woreda sector offices.',
            'achievements' => implode("\n", array_filter([
                $f['investment_projects'] > 0 ? "{$f['investment_projects']} new investment project(s) licensed, ETB {$f['investment_capital']} million registered capital." : null,
                "{$f['jobs_created']} jobs created.",
                number_format($f['cultivated_ha']).' ha cultivated; '.number_format($f['crop_production_qt']).' quintals harvested.',
                number_format($f['livestock_vaccinated']).' head of livestock vaccinated.',
                number_format($f['tourists'])." tourist visitors; ETB {$f['tourism_revenue']} thousand tourism revenue.",
                "ETB {$f['revenue_collected']} million government revenue collected.",
            ])),
            'challenges' => $challenges[$woreda] ?? 'No major challenges this month.',
            'next_steps' => 'Follow up on pending investment applications; continue the vaccination campaign; send next month\'s report on time.',
        ];
    }

    private function seedPlan(User $admin, $woredas): void
    {
        $plan = ZonePlan::firstOrCreate(['title' => 'FY 2026/27 first-half priorities (sample)'], [
            'period' => 'FY 2026/27 H1',
            'period_type' => 'custom',
            'description' => 'Sample plan: zone targets for July to January that every woreda reports progress on.',
            'start_date' => '2026-07-08',
            'due_date' => '2027-01-07',
            'status' => 'active',
            'created_by' => $admin->id,
        ]);
        if (! $plan->wasRecentlyCreated) {
            return;
        }

        $plan->woredas()->sync($woredas->pluck('id'));
        $tasks = collect([
            'Process all pending investment applications',
            'Complete the livestock vaccination campaign',
            'Keep market days and road status up to date for visitors',
            'Send every monthly report by the 10th',
        ])->map(fn ($title, $i) => PlanTask::create(['zone_plan_id' => $plan->id, 'title' => $title, 'target_value' => 100, 'target_unit' => '%', 'sort' => $i]));

        foreach ($woredas as $woreda) {
            $behind = array_key_exists($woreda->name_en, self::MISSING) ? 25 : 0;
            $author = User::where('role', 'woreda')->where('woreda_id', $woreda->id)->orderBy('id')->first() ?? $admin;
            foreach ($tasks as $task) {
                PlanTaskProgress::create([
                    'plan_task_id' => $task->id,
                    'woreda_id' => $woreda->id,
                    'progress' => max(0, min(100, 40 + mt_rand(0, 45) - $behind)),
                    'updated_by' => $author->id,
                ]);
            }
        }
        $this->command?->info('Sample zone plan created with progress for '.$woredas->count().' woredas.');
    }
}
