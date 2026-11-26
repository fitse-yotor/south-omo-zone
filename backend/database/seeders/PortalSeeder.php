<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Attraction;
use App\Models\LeaderMessage;
use App\Models\Opportunity;
use App\Models\RoadStatus;
use App\Models\Sector;
use App\Models\SiteSetting;
use App\Models\Woreda;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Loads the site's current content (exported from src/data/content.js by
 * scripts/export-content.mjs into database/data/content.json). Safe to run once on a fresh database.
 */
class PortalSeeder extends Seeder
{
    public function run(): void
    {
        $d = json_decode(file_get_contents(database_path('data/content.json')), true, 512, JSON_THROW_ON_ERROR);
        $bi = fn (?array $v, string $f) => [$f.'_en' => $v['en'] ?? null, $f.'_am' => $v['am'] ?? null];
        $lines = fn (?array $v, string $f, string $sep = "\n") => [$f.'_en' => implode($sep, $v['en'] ?? []), $f.'_am' => implode($sep, $v['am'] ?? [])];

        DB::transaction(function () use ($d, $bi, $lines) {
            $c = $d['contact'];
            SiteSetting::query()->delete();
            SiteSetting::create(['phone' => $c['phone'], 'email' => $c['email'], 'invest_email' => $c['invest'], 'tourism_email' => $c['tourism'],
                'road_status_checked_on' => $d['roadStatusUpdated']] + $bi($c['address'], 'address') + $bi($c['hours'], 'hours'));

            $l = $d['leader'];
            LeaderMessage::query()->delete();
            LeaderMessage::create(['photo' => $l['photo'] ?: null, 'video_url' => $l['video'] ?: null]
                + $bi($l['name'], 'name') + $bi($l['title'], 'title') + $bi($l['excerpt'], 'excerpt') + $lines($l['message'], 'message', "\n\n"));

            foreach ($d['sectors'] as $i => $s) {
                Sector::updateOrCreate(['slug' => $s['id']], ['icon' => $s['icon'], 'image' => $s['image'], 'sort' => $i] + $bi($s['title'], 'title') + $bi($s['text'], 'text'));
            }
            foreach ($d['woredas'] as $i => $w) {
                Woreda::updateOrCreate(['slug' => $w['id']], ['image' => $w['image'], 'sector_slugs' => $w['sectors'], 'sort' => $i]
                    + $bi($w['name'], 'name') + $bi($w['seat'], 'seat') + $bi($w['peoples'], 'peoples') + $bi($w['tagline'], 'tagline')
                    + $bi($w['about'], 'about') + $lines($w['highlights'], 'highlights'));
            }
            $woreda = Woreda::pluck('id', 'slug');
            $sector = Sector::pluck('id', 'slug');
            Opportunity::query()->delete();
            foreach ($d['opportunities'] as $i => $o) {
                Opportunity::create(['woreda_id' => $woreda[$o['woreda']], 'sector_id' => $sector[$o['sector']], 'land_ha' => $o['landHa'],
                    'investment_usd_m' => $o['investmentUsdM'], 'jobs' => $o['jobs'], 'sort' => $i] + $bi($o['title'], 'title') + $bi($o['summary'], 'summary'));
            }
            foreach ($d['attractions'] as $i => $a) {
                Attraction::updateOrCreate(['slug' => $a['id']], ['image' => $a['image'], 'sort' => $i] + $bi($a['title'], 'title') + $bi($a['tag'], 'tag') + $bi($a['text'], 'text'));
            }
            Announcement::query()->delete();
            // Sample notices keep their deadlines relative to the seeding date, so a fresh install has open items.
            $exported = \Carbon\Carbon::parse($d['exportedOn'] ?? today());
            $shift = fn (string $date) => today()->addDays((int) $exported->diffInDays(\Carbon\Carbon::parse($date), false));
            foreach ($d['announcements'] as $a) {
                Announcement::create(['type' => $a['type'], 'reference' => $a['ref'] ?? null, 'posted_on' => $shift($a['posted']), 'deadline' => $shift($a['deadline'])]
                    + $bi($a['title'], 'title') + $bi($a['org'], 'organization') + $bi($a['location'], 'location') + $bi($a['summary'], 'summary') + $lines($a['details'], 'details'));
            }
            foreach ($d['roadLegs'] as $leg => $r) {
                RoadStatus::updateOrCreate(['leg' => $leg], ['status' => $r['status']] + $bi($r['note'], 'note'));
            }
        });
    }
}
