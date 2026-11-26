<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\ContactMessage;
use App\Models\RoadStatus;
use App\Support\MapData;
use Database\Seeders\PortalSeeder;
use Database\Seeders\SiteContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_endpoint_returns_seeded_portal_content(): void
    {
        $this->seed(PortalSeeder::class);

        $this->getJson('/api/content')
            ->assertOk()
            ->assertJsonCount(8, 'woredas')
            ->assertJsonCount(6, 'sectors')
            ->assertJsonPath('woredas.0.id', 'hamer')
            ->assertJsonStructure(['contact', 'leader' => ['name' => ['en', 'am'], 'message'], 'opportunities', 'attractions', 'announcements', 'roadLegs']);
    }

    public function test_amharic_lists_survive_line_splitting(): void
    {
        $this->seed(PortalSeeder::class);

        $am = $this->getJson('/api/content')->json('woredas.0.highlights.am');
        $this->assertNotEmpty($am);
        foreach ($am as $line) {
            $this->assertTrue(mb_check_encoding($line, 'UTF-8'));
        }
    }

    public function test_saving_content_refreshes_the_cached_response(): void
    {
        $this->seed(PortalSeeder::class);
        $this->getJson('/api/content');

        Announcement::first()->update(['title_en' => 'Updated title']);

        $this->assertContains('Updated title', collect($this->getJson('/api/content')->json('announcements'))->pluck('title.en'));
    }

    public function test_contact_form_validates_stores_and_ignores_bots(): void
    {
        $this->postJson('/api/contact', ['name' => '', 'email' => 'bad'])->assertStatus(422);

        $this->postJson('/api/contact', ['name' => 'Abebe', 'email' => 'abebe@example.com', 'desk' => 'invest', 'message' => 'Interested in honey processing.'])
            ->assertCreated();
        $this->postJson('/api/contact', ['name' => 'Bot', 'email' => 'bot@example.com', 'message' => 'spam spam', 'website' => 'http://spam.example'])
            ->assertOk();

        $this->assertSame(1, ContactMessage::count());
        $this->assertSame('invest', ContactMessage::first()->desk);
    }

    public function test_all_website_sections_are_served(): void
    {
        $this->seed([PortalSeeder::class, SiteContentSeeder::class]);

        $this->getJson('/api/content')->assertOk()
            ->assertJsonCount(4, 'heroSlides')
            ->assertJsonCount(4, 'facts')
            ->assertJsonCount(3, 'markets')
            ->assertJsonCount(5, 'journeys')
            ->assertJsonCount(2, 'itineraries')
            ->assertJsonPath('routeStops.jinka.en', 'Jinka Airport')
            ->assertJsonPath('roadLegs.dimeka-turmi.surface', 'gravel')
            ->assertJsonStructure(['zone' => ['tagline' => ['en', 'am']], 'investSteps' => ['en', 'am'], 'labels' => ['en', 'am'], 'credits', 'stays', 'townServices', 'rainyMonths']);
    }

    public function test_routes_must_follow_roads_on_the_map(): void
    {
        $this->seed(SiteContentSeeder::class);

        $this->assertNull(MapData::routeError(['jinka', 'keyafer', 'weyto']));
        $this->assertNull(MapData::routeError([['stop' => 'turmi'], ['stop' => 'omorate']])); // form-state shape
        $this->assertStringContainsString('no road on the map', MapData::routeError(['jinka', 'omorate']));
    }

    public function test_site_content_seeder_never_overwrites_staff_edits(): void
    {
        $this->seed([PortalSeeder::class, SiteContentSeeder::class]);
        RoadStatus::where('leg', 'dimeka-turmi')->update(['status' => 'closed', 'minutes' => 55]);
        \App\Models\Market::first()->update(['days' => [6]]);

        $this->seed(SiteContentSeeder::class);

        $this->assertSame('closed', RoadStatus::where('leg', 'dimeka-turmi')->value('status'));
        $this->assertSame(55, (int) RoadStatus::where('leg', 'dimeka-turmi')->value('minutes'));
        $this->assertSame([6], \App\Models\Market::first()->days);
        $this->assertSame(3, \App\Models\Market::count());
    }

    public function test_english_only_content_can_be_saved_and_falls_back(): void
    {
        $this->seed([PortalSeeder::class, SiteContentSeeder::class]);
        \App\Models\Announcement::create(['type' => 'vacancy', 'title_en' => 'Driver', 'organization_en' => 'Zone HR',
            'summary_en' => 'Driving licence required.', 'posted_on' => today(), 'deadline' => today()->addWeek()]);

        $a = collect($this->getJson('/api/content')->json('announcements'))->firstWhere('title.en', 'Driver');
        $this->assertSame('Driver', $a['title']['am']);
    }

    public function test_logo_and_sample_notice_settings_reach_the_website(): void
    {
        $this->seed([PortalSeeder::class, SiteContentSeeder::class]);
        $this->getJson('/api/content')->assertJsonPath('zone.showSampleNotice', true)->assertJsonPath('zone.logo', null);

        \App\Models\SiteSetting::current()->update(['logo' => 'brand/emblem.png', 'show_sample_notice' => false]);

        $zone = $this->getJson('/api/content')->json('zone');
        $this->assertFalse($zone['showSampleNotice']);
        $this->assertStringEndsWith('/uploads/brand/emblem.png', $zone['logo']);
    }

    public function test_launch_checklist_tracks_placeholders(): void
    {
        $this->seed([PortalSeeder::class, SiteContentSeeder::class]);
        $open = fn () => collect(\App\Support\LaunchChecklist::items())->reject->done->pluck('label');

        $this->assertContains('Replace the sample vacancies and tenders', $open());
        $this->assertContains('Add the missing woreda seats', $open());

        \App\Models\Announcement::where('is_sample', true)->delete();
        \App\Models\Woreda::whereNull('seat_en')->update(['seat_en' => 'Seat', 'seat_am' => 'መቀመጫ']);

        $this->assertNotContains('Replace the sample vacancies and tenders', $open());
        $this->assertNotContains('Add the missing woreda seats', $open());
    }
}
