<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\ContactMessage;
use Database\Seeders\PortalSeeder;
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
}
