<?php

namespace Tests\Feature;

use App\Filament\Resources\WoredaReportResource\Pages\CreateWoredaReport;
use App\Filament\Resources\WoredaReportResource\Pages\EditWoredaReport;
use App\Models\Circular;
use App\Models\User;
use App\Models\Woreda;
use App\Models\WoredaReport;
use App\Support\UploadLimits;
use Database\Seeders\PortalSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Tests\TestCase;

class ReportFilesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $woredaUser;

    private User $otherWoredaUser;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('uploads');
        $this->seed(PortalSeeder::class);
        [$own, $other] = Woreda::orderBy('sort')->take(2)->get()->all();
        $make = fn ($email, $role, $woreda = null) => User::create(['name' => $email, 'email' => "{$email}@test.local", 'password' => 'secret-password-1', 'role' => $role, 'woreda_id' => $woreda?->id, 'is_active' => true]);
        $this->admin = $make('admin', 'admin');
        $this->woredaUser = $make('own', 'woreda', $own);
        $this->otherWoredaUser = $make('other', 'woreda', $other);
    }

    /** Woreda account files a report with a PDF and a photo through the real form. */
    private function reportWithFiles(): WoredaReport
    {
        $this->actingAs($this->woredaUser);
        Livewire::test(CreateWoredaReport::class)
            ->fillForm([
                'title' => 'October report', 'period' => 'October 2026', 'period_type' => 'monthly', 'period_start' => '2026-10-01',
                'attachments' => [
                    UploadedFile::fake()->create('Signed report October.pdf', 120, 'application/pdf'),
                    UploadedFile::fake()->image('Key Afer market.jpg', 800, 600),
                ],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        return WoredaReport::latest('id')->first();
    }

    private function fileUrl(WoredaReport $report, int $index, bool $download = false): string
    {
        return route('filament.admin.private-file', ['type' => 'report', 'id' => $report->id, 'index' => $index]).($download ? '?download=1' : '');
    }

    public function test_several_files_are_stored_privately_with_their_original_names(): void
    {
        $report = $this->reportWithFiles();

        $this->assertCount(2, $report->attachments);
        $this->assertSame(['Signed report October.pdf', 'Key Afer market.jpg'], $report->files()->pluck('name')->all());
        foreach ($report->attachments as $path) {
            Storage::disk('local')->assertExists($path);   // private disk
            Storage::disk('uploads')->assertMissing($path); // not in the public folder
            $this->assertStringNotContainsString('Signed report', $path); // stored under a random name
        }
    }

    public function test_only_the_zone_and_the_reports_own_woreda_can_open_the_files(): void
    {
        $report = $this->reportWithFiles();

        // Own woreda: PDF opens in the browser, or downloads on request.
        $this->get($this->fileUrl($report, 0))->assertOk()
            ->assertHeader('content-disposition', 'inline; filename="Signed report October.pdf"');
        $this->get($this->fileUrl($report, 0, download: true))->assertOk()
            ->assertHeader('content-disposition', 'attachment; filename="Signed report October.pdf"');
        $this->get($this->fileUrl($report, 1))->assertOk()->assertHeader('content-security-policy', 'sandbox');
        $this->get($this->fileUrl($report, 5))->assertNotFound();

        // Another woreda: not even told the file exists.
        $this->flushSession();
        $this->actingAs($this->otherWoredaUser);
        $this->get($this->fileUrl($report, 0))->assertNotFound();

        // Zone administrator.
        $this->flushSession();
        $this->actingAs($this->admin);
        $this->get($this->fileUrl($report, 0))->assertOk();
    }

    public function test_logged_out_visitors_are_sent_to_the_login_page(): void
    {
        $report = $this->reportWithFiles();
        auth()->logout();
        $this->flushSession();

        $this->get($this->fileUrl($report, 0))->assertRedirect(route('filament.admin.auth.login'));
    }

    public function test_removed_files_and_deleted_reports_leave_nothing_on_disk(): void
    {
        $report = $this->reportWithFiles();
        [$pdf, $photo] = $report->attachments;

        Livewire::test(EditWoredaReport::class, ['record' => $report->getRouteKey()])
            ->set('data.attachments', collect($report->attachments)->filter(fn ($p) => $p === $photo)->mapWithKeys(fn ($p) => [(string) Str::uuid() => $p])->all())
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame([$photo], array_values($report->fresh()->attachments));
        Storage::disk('local')->assertMissing($pdf);
        Storage::disk('local')->assertExists($photo);

        $report->fresh()->delete();
        Storage::disk('local')->assertMissing($photo);
    }

    public function test_web_pages_and_programs_are_refused(): void
    {
        $this->actingAs($this->woredaUser);

        Livewire::test(CreateWoredaReport::class)
            ->fillForm([
                'title' => 'Bad file', 'period' => 'October 2026', 'period_type' => 'monthly', 'period_start' => '2026-10-01',
                'attachments' => [UploadedFile::fake()->create('report.html', 5, 'text/html')],
            ])
            ->call('create')
            ->assertHasErrors();

        $this->assertSame(0, WoredaReport::count());
    }

    public function test_circular_files_are_private_and_only_for_addressed_woredas(): void
    {
        Storage::disk('local')->put('circulars/letter.pdf', '%PDF-1.4 test');
        $circular = Circular::create(['title' => 'Budget calendar', 'body' => 'x', 'attachment' => 'circulars/letter.pdf', 'created_by' => $this->admin->id]);
        $circular->woredas()->attach($this->woredaUser->woreda_id);

        $this->actingAs($this->woredaUser);
        $this->get($circular->attachmentUrl())->assertOk()->assertHeader('content-disposition', 'inline; filename="Budget calendar.pdf"');

        $this->flushSession();
        $this->actingAs($this->otherWoredaUser);
        $this->get($circular->attachmentUrl())->assertNotFound();
    }

    public function test_upload_limit_follows_php_settings(): void
    {
        $this->assertSame(PHP_INT_MAX, UploadLimits::iniKilobytes('__not_a_setting__')); // unset = no limit
        $this->assertLessThanOrEqual(UploadLimits::TARGET_KB, UploadLimits::maxKilobytes());
        $this->assertLessThanOrEqual(UploadLimits::iniKilobytes('upload_max_filesize'), UploadLimits::maxKilobytes());
        $this->assertSame('10 MB', UploadLimits::label(10240));
        $this->assertSame('1.5 MB', UploadLimits::label(1536));
    }
}
