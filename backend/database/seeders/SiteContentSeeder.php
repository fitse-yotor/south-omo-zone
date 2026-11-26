<?php

namespace Database\Seeders;

use App\Models\Attraction;
use App\Models\Fact;
use App\Models\GuideItem;
use App\Models\HeroSlide;
use App\Models\Itinerary;
use App\Models\Journey;
use App\Models\Label;
use App\Models\Market;
use App\Models\People;
use App\Models\PhotoCredit;
use App\Models\RoadStatus;
use App\Models\RouteStop;
use App\Models\SiteSetting;
use App\Support\ContentCache;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Fills the home page, facts, markets, peoples, guide texts, tourism towns, stays, road details,
 * journeys, itineraries, interface labels and photo credits from database/data/content.json.
 *
 * Safe on a live site: it only fills tables that are empty and adds labels that do not exist yet.
 * It never overwrites what staff have edited.   php artisan db:seed --class=SiteContentSeeder --force
 */
class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $d = json_decode(file_get_contents(database_path('data/content.json')), true, 512, JSON_THROW_ON_ERROR);
        $bi = fn (?array $v, string $f) => [$f.'_en' => $v['en'] ?? null, $f.'_am' => $v['am'] ?? null];
        $empty = fn (string $model) => $model::query()->doesntExist();

        DB::transaction(function () use ($d, $bi, $empty) {
            $settings = SiteSetting::current();
            if (! $settings->name_en) {
                $z = $d['zone'];
                $settings->update($bi($z['name'], 'name') + $bi($z['admin'], 'admin') + $bi($z['region'], 'region')
                    + $bi($z['capital'], 'capital') + $bi($z['tagline'], 'tagline') + $bi($z['intro'], 'intro'));
            }
            if ($settings->rainy_months === null) {
                $settings->update(['rainy_months' => $d['rainyMonths']]);
            }

            if ($empty(HeroSlide::class)) {
                foreach ($d['heroSlides'] as $i => $s) {
                    HeroSlide::create(['image' => $s['id'], 'sort' => $i] + $bi($s['caption'], 'caption'));
                }
            }
            if ($empty(Fact::class)) {
                foreach ($d['facts'] as $i => $f) {
                    Fact::create(['value' => $f['value'], 'sort' => $i] + $bi($f['label'], 'label'));
                }
            }
            if ($empty(Market::class)) {
                foreach ($d['markets'] as $i => $m) {
                    Market::create(['woreda_slug' => $m['woreda'] ?? null, 'stop_key' => $m['stop'] ?? null, 'days' => $m['days'], 'sort' => $i] + $bi($m['place'], 'place'));
                }
            }
            if ($empty(People::class)) {
                foreach ($d['peoples'] as $i => $p) {
                    People::create(['name_en' => $p['en'], 'name_am' => $p['am'], 'sort' => $i]);
                }
            }
            if ($empty(GuideItem::class)) {
                foreach ($d['guide'] as $group => $langs) {
                    foreach ($langs['en'] as $i => [$title, $text]) {
                        [$titleAm, $textAm] = $langs['am'][$i] ?? [null, null];
                        GuideItem::create(['group' => $group, 'sort' => $i, 'title_en' => $title, 'text_en' => $text, 'title_am' => $titleAm, 'text_am' => $textAm]);
                    }
                }
            }
            foreach ($d['stops'] as $s) {
                $stop = RouteStop::firstOrCreate(['key' => $s['key']], ['services' => $s['services'], 'image' => $s['photo'], 'sort' => $s['sort']] + $bi($s['name'], 'name'));
                if ($stop->wasRecentlyCreated) {
                    foreach ($s['stays'] as $i => $st) {
                        $stop->stays()->create(['sort' => $i] + $bi($st['name'], 'name') + $bi($st['type'], 'type'));
                    }
                }
            }
            foreach ($d['roadLegs'] as $leg => $r) {
                $row = RoadStatus::firstOrCreate(['leg' => $leg], ['status' => $r['status'], 'surface' => $r['surface'], 'minutes' => $r['minutes']]);
                // Rows created before road details existed still hold the column defaults: fill in the real values.
                if (! $row->wasRecentlyCreated && $row->surface === 'gravel' && (int) $row->minutes === 60) {
                    $row->update(['surface' => $r['surface'], 'minutes' => $r['minutes']]);
                }
            }
            if ($empty(Journey::class)) {
                foreach ($d['journeys'] as $i => $j) {
                    Journey::create(['slug' => $j['id'], 'image' => $j['image'], 'stops' => $j['stops'], 'stay_at' => $j['stayAt'] ?? [], 'sort' => $i]
                        + $bi($j['name'], 'name') + $bi($j['sub'], 'sub') + $bi($j['tip'], 'tip') + $bi($j['stayNote'] ?? null, 'stay_note'));
                }
            }
            if ($empty(Itinerary::class)) {
                foreach ($d['itineraries'] as $i => $it) {
                    Itinerary::create(['slug' => $it['id'], 'start_weekday' => $it['start'], 'image' => $it['image'], 'sort' => $i,
                        'days' => array_map(fn ($day) => ['stops' => $day['stops'], 'night' => $day['night'], 'note_en' => $day['note']['en'] ?? '', 'note_am' => $day['note']['am'] ?? ''], $it['days'])]
                        + $bi($it['name'], 'name') + $bi($it['sub'], 'sub'));
                }
            }
            foreach ($d['attractions'] as $a) {
                if (! empty($a['journey'])) {
                    Attraction::where('slug', $a['id'])->whereNull('journey_slug')->update(['journey_slug' => $a['journey']]);
                }
            }
            // Labels: add keys that do not exist yet (new website versions may add labels); never overwrite edits.
            $existing = Label::pluck('key')->flip();
            foreach ($d['labels']['en'] as $key => $en) {
                if (! isset($existing[$key])) {
                    Label::create(['key' => $key, 'en' => $en, 'am' => $d['labels']['am'][$key] ?? null]);
                }
            }
            foreach ($d['credits'] as $c) {
                PhotoCredit::firstOrCreate(['photo_id' => $c['id']], ['title' => $c['title'] ?? null, 'author' => $c['author'], 'license' => $c['license'] ?? null, 'source_url' => $c['source'] ?? null]);
            }
        });

        ContentCache::flush();
    }
}
