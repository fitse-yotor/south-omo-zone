<?php

namespace App\Support;

use App\Filament\Resources;
use App\Models;

/**
 * What still needs to be done before (and after) the site goes live:
 * placeholders left from the original content, samples, missing seats and missing Amharic.
 */
class LaunchChecklist
{
    /** Bilingual sections checked for missing Amharic: model => [fields, admin resource]. */
    protected const AMHARIC = [
        Models\Announcement::class => [['title', 'organization', 'summary'], Resources\AnnouncementResource::class, 'Vacancies & tenders'],
        Models\Opportunity::class => [['title', 'summary'], Resources\OpportunityResource::class, 'Opportunities'],
        Models\Sector::class => [['title', 'text'], Resources\SectorResource::class, 'Sectors'],
        Models\Woreda::class => [['name', 'tagline', 'about'], Resources\WoredaResource::class, 'Woredas'],
        Models\Attraction::class => [['title', 'text'], Resources\AttractionResource::class, 'Attractions'],
        Models\HeroSlide::class => [['caption'], Resources\HeroSlideResource::class, 'Slideshow'],
        Models\Fact::class => [['label'], Resources\FactResource::class, 'Key facts'],
        Models\GuideItem::class => [['title', 'text'], Resources\GuideItemResource::class, 'Steps, commitments & tips'],
        Models\Market::class => [['place'], Resources\MarketResource::class, 'Weekly markets'],
        Models\People::class => [['name'], Resources\PeopleResource::class, 'Peoples'],
        Models\Journey::class => [['name', 'tip'], Resources\JourneyResource::class, 'Journeys'],
        Models\Itinerary::class => [['name'], Resources\ItineraryResource::class, 'Itineraries'],
        Models\RouteStop::class => [['name'], Resources\RouteStopResource::class, 'Towns'],
        Models\LeaderMessage::class => [['name', 'title', 'excerpt', 'message'], Resources\LeaderMessageResource::class, "Leader's message"],
        Models\SiteSetting::class => [['tagline', 'intro', 'address'], Resources\SiteSettingResource::class, 'Zone texts & contact'],
    ];

    /** @return array<int, array{label: string, done: bool, detail: string, url: string}> */
    public static function items(): array
    {
        $seed = json_decode(@file_get_contents(database_path('data/content.json')) ?: '{}', true);
        $s = Models\SiteSetting::current();
        $leader = Models\LeaderMessage::current();
        $settingsUrl = Resources\SiteSettingResource::getUrl();
        $items = [];

        $items[] = ['label' => 'Upload the zone emblem', 'done' => (bool) $s->logo, 'url' => $settingsUrl,
            'detail' => $s->logo ? 'Your emblem is in use.' : 'The site still shows the built-in emblem (South Ethiopia Regional State, Office of the President).'];

        $c = $seed['contact'] ?? [];
        $stale = collect(['phone' => 'phone', 'email' => 'general email', 'invest_email' => 'investment email', 'tourism_email' => 'tourism email'])
            ->filter(fn ($label, $field) => blank($s->{$field}) || $s->{$field} === ($c[['phone' => 'phone', 'email' => 'email', 'invest_email' => 'invest', 'tourism_email' => 'tourism'][$field]] ?? null))
            ->values();
        $items[] = ['label' => 'Replace the placeholder contact details', 'done' => $stale->isEmpty(), 'url' => $settingsUrl,
            'detail' => $stale->isEmpty() ? 'Phone and emails have been updated.' : 'Still the original placeholder: '.$stale->join(', ').'.'];

        $missing = collect([
            'name' => ! $leader || $leader->name_en === ($seed['leader']['name']['en'] ?? null),
            'photo' => ! $leader?->photo,
            'video' => ! $leader?->video_url,
        ])->filter()->keys();
        $items[] = ['label' => "Complete the leader's message", 'done' => $missing->isEmpty(), 'url' => Resources\LeaderMessageResource::getUrl(),
            'detail' => $missing->isEmpty() ? 'Name, photo and video are set.' : 'Missing: '.$missing->join(', ').'.'];

        $n = Models\Announcement::where('is_sample', true)->count();
        $items[] = ['label' => 'Replace the sample vacancies and tenders', 'done' => $n === 0, 'url' => Resources\AnnouncementResource::getUrl(),
            'detail' => $n ? "$n sample notices are still published." : 'No samples left.'];

        $n = Models\Opportunity::where('is_sample', true)->count();
        $items[] = ['label' => 'Confirm or replace the sample opportunities', 'done' => $n === 0, 'url' => Resources\OpportunityResource::getUrl(),
            'detail' => $n ? "$n opportunities are still marked as samples." : 'No samples left.'];

        $items[] = ['label' => 'Turn off the "sample listing" notes', 'done' => ! $s->show_sample_notice, 'url' => $settingsUrl,
            'detail' => $s->show_sample_notice ? 'Visitors still see "Sample listing…" on opportunities and notices.' : 'Notes are hidden.'];

        $noSeat = Models\Woreda::whereNull('seat_en')->orWhere('seat_en', '')->pluck('name_en');
        $items[] = ['label' => 'Add the missing woreda seats', 'done' => $noSeat->isEmpty(), 'url' => Resources\WoredaResource::getUrl(),
            'detail' => $noSeat->isEmpty() ? 'Every woreda has its seat.' : 'No administrative seat yet: '.$noSeat->join(', ').'.'];

        $gaps = self::amharicGaps();
        $labelGaps = Models\Label::where(fn ($q) => $q->whereNull('am')->orWhere('am', '')->orWhereColumn('am', 'en'))->count();
        $total = $gaps->sum('count') + $labelGaps;
        $detail = $total === 0 ? 'Every text has an Amharic version.' : $gaps->map(fn ($g) => "{$g['section']} ({$g['count']})")
            ->when($labelGaps, fn ($c) => $c->push("Interface labels ($labelGaps)"))->join(', ');
        $items[] = ['label' => 'Fill in missing Amharic', 'done' => $total === 0, 'detail' => $detail,
            'url' => $labelGaps && $gaps->isEmpty() ? Resources\LabelResource::getUrl() : ($gaps->first()['url'] ?? Resources\LabelResource::getUrl())];

        $items[] = ['label' => 'Have a native speaker review the Amharic', 'done' => (bool) $s->amharic_reviewed_at, 'url' => $settingsUrl,
            'detail' => $s->amharic_reviewed_at ? 'Reviewed on '.$s->amharic_reviewed_at->format('d M Y').'.'
                : 'Reviewers correct texts in each item\'s Amharic tab, and labels under Settings → Interface labels. Then switch on "Amharic reviewed" in Zone texts & contact.'];

        return $items;
    }

    /** Sections with records whose Amharic is empty, with counts and links. */
    public static function amharicGaps()
    {
        return collect(self::AMHARIC)->map(function ($cfg, $model) {
            [$fields, $resource, $section] = $cfg;
            $count = $model::query()->where(function ($q) use ($fields) {
                foreach ($fields as $f) {
                    $q->orWhereNull($f.'_am')->orWhere($f.'_am', '');
                }
            })->count();

            return ['section' => $section, 'count' => $count, 'url' => $resource::getUrl()];
        })->filter(fn ($g) => $g['count'] > 0)->values();
    }
}
