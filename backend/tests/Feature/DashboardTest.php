<?php

namespace Tests\Feature;

use App\Filament\Pages\Dashboard;
use App\Filament\Widgets\CumulativeTrendChart;
use App\Filament\Widgets\IndicatorStats;
use App\Filament\Widgets\WoredaComparisonChart;
use App\Filament\Widgets\WoredaScorecard;
use App\Models\User;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Support\Indicators;
use Carbon\CarbonImmutable;
use Database\Seeders\PortalSeeder;
use Database\Seeders\WoredaReportSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PortalSeeder::class);
        $this->admin = User::create(['name' => 'Admin', 'email' => 'admin@test.local', 'password' => 'secret-password-1', 'role' => 'admin', 'is_active' => true]);
    }

    private function report(Woreda $woreda, string $month, array $figures, array $extra = []): WoredaReport
    {
        return WoredaReport::create([
            'woreda_id' => $woreda->id, 'submitted_by' => $this->admin->id, 'title' => "Report {$month}",
            'period' => $month, 'period_type' => 'monthly', 'period_start' => CarbonImmutable::parse("{$month}-15"),
            'status' => 'approved', ...$figures, ...$extra,
        ]);
    }

    public function test_month_is_stored_as_the_first_day(): void
    {
        $report = $this->report(Woreda::first(), '2026-08', ['jobs_created' => 5]);

        $this->assertSame('2026-08-01', $report->fresh()->period_start->toDateString());
    }

    public function test_totals_follow_the_counting_rules_and_fiscal_year(): void
    {
        [$a, $b] = Woreda::orderBy('sort')->take(2)->get();
        $this->report($a, '2026-07', ['jobs_created' => 10]);
        $this->report($a, '2026-10', ['jobs_created' => 5]);
        $this->report($b, '2026-08', ['jobs_created' => 7]);
        $this->report($b, '2026-06', ['jobs_created' => 100]);                        // previous fiscal year
        $this->report($b, '2026-09', ['jobs_created' => 1000], ['status' => 'rejected']);   // sent back: not counted
        $this->report($b, '2026-09', ['jobs_created' => 2000], ['period_type' => 'quarterly']); // not monthly: not counted

        $this->assertSame(22.0, Indicators::totals(2026)['jobs_created']);
        $this->assertSame(15.0, Indicators::totals(2026, $a->id)['jobs_created']);
        $this->assertSame(100.0, Indicators::totals(2025)['jobs_created']);
        $this->assertSame(17.0, Indicators::totals(2026, null, CarbonImmutable::create(2026, 8, 1))['jobs_created']);

        // Running total: Jul 10, Aug 17, Sep 17 (no countable report), Oct 22, then stops.
        $this->assertSame([10.0, 17.0, 17.0, 22.0, null], array_slice(Indicators::cumulative('jobs_created', 2026), 0, 5));
        $this->assertSame('2026-10', Indicators::latestMonth(2026)->format('Y-m'));
    }

    public function test_fiscal_year_helpers(): void
    {
        $this->assertSame('2026-07-01', Indicators::fiscalYearStart(CarbonImmutable::create(2027, 3, 9))->toDateString());
        $this->assertSame('2025-07-01', Indicators::fiscalYearStart(CarbonImmutable::create(2026, 6, 30))->toDateString());
        $this->assertSame('FY 2026/27 (EFY 2019)', Indicators::fiscalYearLabel(2026));
    }

    public function test_zone_staff_see_every_dashboard_widget(): void
    {
        $woreda = Woreda::first();
        $this->report($woreda, now()->subMonth()->format('Y-m'), ['investment_capital' => 42.5, 'tourists' => 300]);
        $this->actingAs($this->admin);
        $filters = ['fiscal_year' => Indicators::fiscalYearStart(now()->subMonth())->year];

        $this->get(Dashboard::getUrl())->assertOk()->assertSee('Zone dashboard');
        Livewire::test(IndicatorStats::class, ['filters' => $filters])->assertOk()->assertSee('Whole zone')->assertSee('42.5');
        Livewire::test(CumulativeTrendChart::class, ['filters' => $filters])->assertOk()->assertSee('Cumulative progress');
        Livewire::test(WoredaComparisonChart::class, ['filters' => $filters])->assertOk()->assertSee('Woredas compared');
        Livewire::test(WoredaScorecard::class, ['filters' => $filters])->assertOk()->assertSee($woreda->name_en)->assertSee('monthly reports received');
    }

    public function test_woreda_accounts_only_ever_see_their_own_woreda(): void
    {
        [$own, $other] = Woreda::orderBy('sort')->take(2)->get();
        $month = now()->subMonth()->format('Y-m');
        $this->report($own, $month, ['tourists' => 111]);
        $this->report($other, $month, ['tourists' => 999]);
        $user = User::create(['name' => 'W', 'email' => 'w@test.local', 'password' => 'secret-password-1', 'role' => 'woreda', 'woreda_id' => $own->id, 'is_active' => true]);
        $this->actingAs($user);

        // Even when the request asks for another woreda, the figures stay their own.
        Livewire::test(IndicatorStats::class, ['filters' => ['woreda_id' => $other->id]])
            ->assertSee($own->name_en.' woreda')->assertSee('111')->assertDontSee('999')->assertDontSee('1,110');
        $this->assertFalse(WoredaScorecard::canView());
        $this->assertFalse(WoredaComparisonChart::canView());
        $this->get(Dashboard::getUrl())->assertOk()->assertSee("{$own->name_en} woreda dashboard");
    }

    public function test_sample_seeder_fills_two_fiscal_years_with_gaps(): void
    {
        $this->seed(WoredaReportSeeder::class);

        $this->assertSame(8 * 16 - 3, WoredaReport::count()); // 3 months deliberately missing
        $this->assertSame(1, WoredaReport::where('status', 'rejected')->count());
        $this->assertGreaterThan(0, Indicators::totals(2025)['tourists']);
        $this->assertGreaterThan(0, Indicators::totals(2026)['investment_capital']);

        $this->seed(WoredaReportSeeder::class); // running again adds nothing
        $this->assertSame(8 * 16 - 3, WoredaReport::count());
    }

    public function test_built_in_photos_and_emblem_are_served_for_admin_previews(): void
    {
        $this->get('/images/turmi-hills.jpg')->assertOk()->assertHeader('content-type', 'image/jpeg');
        $this->get('/brand/logo.png')->assertOk();
        $this->get('/images/not-a-photo.jpg')->assertNotFound();
        $this->get('/images/..%2F..%2Fbackend%2F.env')->assertNotFound();
        $this->get('/images/.env')->assertNotFound();
    }
}
