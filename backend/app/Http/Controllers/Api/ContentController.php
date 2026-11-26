<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
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
use App\Models\RouteStop;
use App\Models\LeaderMessage;
use App\Models\Opportunity;
use App\Models\RoadStatus;
use App\Models\Sector;
use App\Models\SiteSetting;
use App\Models\Woreda;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * Everything the React site can change from the admin panel, in one cached response.
 * Shapes match src/data/content.js, so the frontend only swaps the data source.
 */
class ContentController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $data = Cache::remember(ContentCache::KEY, now()->addMinutes(10), function () {
            $settings = SiteSetting::current();

            $attractions = Attraction::orderBy('sort')->get();
            $sectors = Sector::orderBy('sort')->get();
            $woredas = Woreda::orderBy('sort')->get();
            $slides = HeroSlide::orderBy('sort')->get();
            $stops = RouteStop::with('stays')->orderBy('sort')->get();
            $journeys = Journey::orderBy('sort')->get();
            $itineraries = Itinerary::orderBy('sort')->get();
            $peoples = People::orderBy('sort')->get();
            $labels = Label::all();

            // Built-in photo credits, plus a credit line for every uploaded photo that has one.
            $credits = PhotoCredit::orderBy('id')->get()->map->toPortal()
                ->concat(collect([$sectors, $woredas, $attractions, $slides, $journeys, $itineraries, $stops])->flatten()
                    ->map->uploadedPhotoCredit()->filter())
                ->values();

            return [
                'zone' => $settings->zoneTexts(),
                'contact' => $settings->toPortal(),
                'leader' => LeaderMessage::current()?->toPortal(),
                'heroSlides' => $slides->map->toPortal()->values(),
                'facts' => Fact::orderBy('sort')->get()->map->toPortal()->values(),
                'sectors' => $sectors->map->toPortal()->values(),
                'woredas' => $woredas->map->toPortal()->values(),
                'opportunities' => Opportunity::with(['woreda', 'sector'])->where('is_published', true)->orderBy('sort')->orderBy('id')->get()->map->toPortal()->values(),
                'attractions' => $attractions->map->toPortal()->values(),
                'attractionJourney' => $attractions->filter->journey_slug->mapWithKeys(fn ($a) => [$a->slug => $a->journey_slug]),
                // Open notices plus those closed in the last 60 days (the site can show closed ones on request).
                'announcements' => Announcement::where('is_published', true)->whereDate('deadline', '>=', today()->subDays(60))
                    ->orderBy('deadline')->get()->map->toPortal()->values(),
                'markets' => Market::orderBy('sort')->get()->map->toPortal()->values(),
                'peoples' => $peoples->pluck('name_en')->values(),
                'peoplesAm' => $peoples->map(fn ($p) => $p->name_am ?: $p->name_en)->values(),
                'investSteps' => GuideItem::portalGroup('step'),
                'principles' => GuideItem::portalGroup('principle'),
                'etiquette' => GuideItem::portalGroup('etiquette'),
                'routeStops' => $stops->mapWithKeys(fn ($s) => [$s->key => $s->bi('name')]),
                'townServices' => $stops->filter(fn ($s) => ! empty($s->services))->mapWithKeys(fn ($s) => [$s->key => array_values($s->services)]),
                'townPhotos' => $stops->filter(fn ($s) => $s->photoRef())->mapWithKeys(fn ($s) => [$s->key => $s->photoRef()]),
                'stays' => $stops->filter(fn ($s) => $s->stays->isNotEmpty())->mapWithKeys(fn ($s) => [$s->key => $s->stays->map->toPortal()->values()]),
                'roadLegs' => RoadStatus::all()->mapWithKeys(fn ($r) => [$r->leg => ['status' => $r->status, 'note' => $r->bi('note'), 'surface' => $r->surface, 'minutes' => (int) $r->minutes]]),
                'roadStatusUpdated' => $settings->road_status_checked_on?->toDateString(),
                'rainyMonths' => array_values(array_map('intval', $settings->rainy_months ?? [])),
                'journeys' => $journeys->map->toPortal()->values(),
                'itineraries' => $itineraries->map->toPortal()->values(),
                'labels' => [
                    'en' => $labels->filter(fn ($l) => filled($l->en))->pluck('en', 'key'),
                    'am' => $labels->filter(fn ($l) => filled($l->am))->pluck('am', 'key'),
                ],
                'credits' => $credits,
            ];
        });

        return response()->json($data)->header('Cache-Control', 'public, max-age=60');
    }
}
