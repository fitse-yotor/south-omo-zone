<?php

namespace Tests\Feature;

use App\Filament\Pages\SystemStatus;
use App\Filament\Resources\CircularResource;
use App\Filament\Resources\CircularResource\Pages\CreateCircular;
use App\Filament\Resources\CircularResource\Pages\ViewCircular;
use App\Filament\Resources\WoredaReportResource;
use App\Filament\Resources\WoredaReportResource\Pages\CreateWoredaReport;
use App\Filament\Resources\WoredaReportResource\Pages\EditWoredaReport;
use App\Filament\Resources\WoredaReportResource\Pages\ViewWoredaReport;
use App\Filament\Resources\ZonePlanResource\Pages\CreateZonePlan;
use App\Filament\Widgets\WoredaScorecard;
use App\Models\Circular;
use App\Models\User;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Models\ZonePlan;
use App\Support\Indicators;
use Database\Seeders\PortalSeeder;
use Database\Seeders\WoredaReportSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CommunicationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $editor;

    private Woreda $own;

    private Woreda $other;

    private User $woredaUser;

    private User $otherWoredaUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PortalSeeder::class);
        [$this->own, $this->other] = Woreda::orderBy('sort')->take(2)->get()->all();
        $make = fn ($email, $role, $woreda = null) => User::create(['name' => ucfirst($role).' '.$email, 'email' => "{$email}@test.local", 'password' => 'secret-password-1', 'role' => $role, 'woreda_id' => $woreda?->id, 'is_active' => true]);
        $this->admin = $make('admin', 'admin');
        $this->editor = $make('editor', 'editor');
        $this->woredaUser = $make('own', 'woreda', $this->own);
        $this->otherWoredaUser = $make('other', 'woreda', $this->other);
    }

    private function report(array $attributes = []): WoredaReport
    {
        return WoredaReport::create([
            'woreda_id' => $this->own->id, 'submitted_by' => $this->woredaUser->id, 'title' => 'October report',
            'period' => 'October 2026', 'period_type' => 'monthly', 'period_start' => '2026-10-01', 'status' => 'submitted',
            ...$attributes,
        ]);
    }

    private function notificationTitles(User $user): array
    {
        return $user->fresh()->notifications->pluck('data.title')->all();
    }

    // ── Reports ─────────────────────────────────────────────────

    public function test_a_woreda_cannot_approve_its_own_report_or_file_it_for_another_woreda(): void
    {
        $this->actingAs($this->woredaUser);

        Livewire::test(CreateWoredaReport::class)
            ->fillForm(['title' => 'November report', 'period' => 'November 2026', 'period_type' => 'monthly', 'period_start' => '2026-11-03'])
            ->set('data.status', 'approved')          // tampered request
            ->set('data.woreda_id', $this->other->id) // tampered request
            ->call('create')
            ->assertHasNoFormErrors();

        $report = WoredaReport::latest('id')->first();
        $this->assertSame($this->own->id, $report->woreda_id);
        $this->assertSame('submitted', $report->status);
        $this->assertSame('2026-11-01', $report->period_start->toDateString());
        $this->assertContains("New report from {$this->own->name_en}", $this->notificationTitles($this->admin));
        $this->assertContains("New report from {$this->own->name_en}", $this->notificationTitles($this->editor));
        $this->assertEmpty($this->notificationTitles($this->woredaUser)); // the actor is not notified
    }

    public function test_accepted_reports_are_locked_for_the_woreda(): void
    {
        $approved = $this->report(['status' => 'approved']);
        $this->actingAs($this->woredaUser);

        $this->assertFalse(WoredaReportResource::canEdit($approved));
        $this->get(WoredaReportResource::getUrl('edit', ['record' => $approved]))->assertForbidden();
        $this->assertFalse(WoredaReportResource::canDelete($approved));
    }

    public function test_sending_back_then_correcting_a_report_notifies_each_side(): void
    {
        $report = $this->report();

        $this->actingAs($this->admin);
        Livewire::test(ViewWoredaReport::class, ['record' => $report->getRouteKey()])
            ->callAction('request_revision', ['reason' => 'Crop figure looks too high.']);
        $report->refresh();
        $this->assertSame('rejected', $report->status);
        $this->assertSame('Crop figure looks too high.', $report->zone_feedback);
        $this->assertSame(1, $report->comments()->count());
        $this->assertContains('Report sent back for revision', $this->notificationTitles($this->woredaUser));
        $this->assertEmpty($this->notificationTitles($this->otherWoredaUser));

        $this->actingAs($this->woredaUser);
        Livewire::test(EditWoredaReport::class, ['record' => $report->getRouteKey()])
            ->fillForm(['crop_production_qt' => 900])
            ->set('data.status', 'approved') // tampered: must not stick
            ->call('save')
            ->assertHasNoFormErrors();
        $this->assertSame('submitted', $report->fresh()->status);
        $this->assertContains("{$this->own->name_en} sent a corrected report", $this->notificationTitles($this->admin));
    }

    public function test_discussion_messages_reach_the_other_side(): void
    {
        $report = $this->report();
        $this->actingAs($this->woredaUser);

        Livewire::test(ViewWoredaReport::class, ['record' => $report->getRouteKey()])
            ->callAction('comment', ['body' => 'Is the livestock figure needed for pastoral kebeles too?'])
            ->assertSee('Is the livestock figure needed');

        $this->assertSame(1, $report->comments()->count());
        $this->assertNotEmpty($this->notificationTitles($this->admin));
        $this->assertEmpty($this->notificationTitles($this->otherWoredaUser));
    }

    public function test_woredas_cannot_open_another_woredas_report(): void
    {
        $report = $this->report();
        $this->actingAs($this->otherWoredaUser);

        $this->get(WoredaReportResource::getUrl('view', ['record' => $report]))->assertNotFound();
    }

    // ── Circulars ───────────────────────────────────────────────

    public function test_circular_goes_to_every_woreda_and_tracks_reading_and_acknowledgement(): void
    {
        $this->actingAs($this->admin);
        Livewire::test(CreateCircular::class)
            ->fillForm(['title' => 'Budget calendar', 'body' => 'Send budget requests by 30 December.', 'priority' => 'urgent', 'requires_acknowledgement' => true])
            ->call('create')
            ->assertHasNoFormErrors();

        $circular = Circular::first();
        $this->assertSame(Woreda::count(), $circular->woredas()->count()); // empty selection = all woredas
        $this->assertContains('URGENT circular: Budget calendar', $this->notificationTitles($this->woredaUser));

        $this->actingAs($this->woredaUser);
        $this->assertSame('1', CircularResource::getNavigationBadge());
        Livewire::test(ViewCircular::class, ['record' => $circular->getRouteKey()])
            ->assertSee('Not acknowledged yet')
            ->callAction('acknowledge', ['response' => 'Our focal person is Ato Bekele.']);

        $receipt = $circular->fresh()->woredas->firstWhere('id', $this->own->id)->pivot;
        $this->assertNotNull($receipt->read_at);
        $this->assertNotNull($receipt->acknowledged_at);
        $this->assertSame('Our focal person is Ato Bekele.', $receipt->response);
        $this->assertNull(CircularResource::getNavigationBadge());
        $this->assertContains("{$this->own->name_en} acknowledged a circular", $this->notificationTitles($this->admin));

        // Only the woreda's own row changed.
        $this->assertNull($circular->fresh()->woredas->firstWhere('id', $this->other->id)->pivot->read_at);
    }

    public function test_woredas_only_see_circulars_addressed_to_them(): void
    {
        $circular = Circular::create(['title' => 'Only for one', 'body' => 'x', 'created_by' => $this->admin->id]);
        $circular->woredas()->attach($this->own->id);

        $this->actingAs($this->otherWoredaUser);
        $this->get(CircularResource::getUrl('view', ['record' => $circular]))->assertNotFound();
        $this->assertFalse(CircularResource::canCreate());
    }

    // ── Plans, reminders ────────────────────────────────────────

    public function test_new_active_plan_is_assigned_to_all_woredas_when_none_chosen(): void
    {
        $this->actingAs($this->admin);
        Livewire::test(CreateZonePlan::class)
            ->fillForm(['title' => 'Q2 plan', 'period' => 'FY 2026/27 Q2', 'period_type' => 'quarterly', 'status' => 'active'])
            ->set('data.tasks', ['task-1' => ['title' => 'Send every report on time', 'target_value' => 100, 'target_unit' => '%']])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertSame(Woreda::count(), ZonePlan::first()->woredas()->count());
        $this->assertContains('New zone plan: Q2 plan', $this->notificationTitles($this->woredaUser));
    }

    public function test_late_woredas_can_be_reminded_once_a_day(): void
    {
        $this->actingAs($this->admin);
        $filters = ['filters' => ['fiscal_year' => Indicators::fiscalYearStart()->year]];

        Livewire::test(WoredaScorecard::class, $filters)->callTableAction('remind', $this->own);
        Livewire::test(WoredaScorecard::class, $filters)->callTableAction('remind_all');

        $reminders = fn (User $u) => collect($this->notificationTitles($u))->filter(fn ($t) => str_starts_with($t, 'Reminder:'))->count();
        $this->assertSame(1, $reminders($this->woredaUser));      // not reminded twice the same day
        $this->assertSame(1, $reminders($this->otherWoredaUser)); // reached by "remind all"
    }

    // ── System status, sample data ──────────────────────────────

    public function test_system_status_is_for_administrators_only(): void
    {
        $this->actingAs($this->admin);
        $this->get(SystemStatus::getUrl())->assertOk()->assertSee('PHP OPcache')->assertSee('Debug mode');

        $this->flushSession(); // a new login, not a user switch inside the admin's session
        $this->actingAs($this->editor);
        $this->get(SystemStatus::getUrl())->assertForbidden();
    }

    public function test_sample_seeder_adds_a_discussion_and_a_circular(): void
    {
        $this->seed(WoredaReportSeeder::class);

        $this->assertSame(3, WoredaReport::where('status', 'rejected')->first()->comments()->count());
        $circular = Circular::first();
        $this->assertSame(Woreda::count(), $circular->woredas()->count());
        $this->assertSame(Woreda::count() - 2, $circular->woredas()->whereNotNull('acknowledged_at')->count());
    }
}
