<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attraction;
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

            return [
                'contact' => $settings->toPortal(),
                'leader' => LeaderMessage::current()?->toPortal(),
                'sectors' => Sector::orderBy('sort')->get()->map->toPortal()->values(),
                'woredas' => Woreda::orderBy('sort')->get()->map->toPortal()->values(),
                'opportunities' => Opportunity::with(['woreda', 'sector'])->where('is_published', true)->orderBy('sort')->orderBy('id')->get()->map->toPortal()->values(),
                'attractions' => Attraction::orderBy('sort')->get()->map->toPortal()->values(),
                // Open notices plus those closed in the last 60 days (the site can show closed ones on request).
                'announcements' => Announcement::where('is_published', true)->whereDate('deadline', '>=', today()->subDays(60))
                    ->orderBy('deadline')->get()->map->toPortal()->values(),
                'roadLegs' => RoadStatus::all()->mapWithKeys(fn ($r) => [$r->leg => ['status' => $r->status, 'note' => $r->bi('note')]]),
                'roadStatusUpdated' => $settings->road_status_checked_on?->toDateString(),
            ];
        });

        return response()->json($data)->header('Cache-Control', 'public, max-age=60');
    }
}
