<?php

namespace App\Support;

use App\Filament\Resources\CircularResource;
use App\Filament\Resources\WoredaReportResource;
use App\Filament\Resources\ZonePlanResource;
use App\Models\Circular;
use App\Models\User;
use App\Models\WoredaReport;
use App\Models\ZonePlan;
use Filament\Notifications\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Who hears about what, between the zone and the woredas (the bell in the admin panel).
 * Zone side: administrators and content editors. Woreda side: that woreda's active accounts.
 * The person who did the action is never notified of it.
 */
class PortalNotifier
{
    public static function zoneReviewers(): Collection
    {
        return self::exceptActor(User::where('is_active', true)->whereIn('role', ['admin', 'editor'])->get());
    }

    public static function woredaUsers(int|array $woredaIds): Collection
    {
        return self::exceptActor(User::where('is_active', true)->where('role', 'woreda')->whereIn('woreda_id', (array) $woredaIds)->get());
    }

    // ── Reports ─────────────────────────────────────────────────

    public static function reportSubmitted(WoredaReport $report, bool $resubmitted = false): void
    {
        $woreda = $report->woreda?->name_en;
        self::send(self::zoneReviewers(),
            $resubmitted ? "{$woreda} sent a corrected report" : "New report from {$woreda}",
            $report->title,
            'heroicon-o-document-arrow-up', 'info',
            self::reportUrl($report));
    }

    public static function reportReviewed(WoredaReport $report, ?string $reason = null): void
    {
        $approved = $report->status === 'approved';
        self::send(self::woredaUsers($report->woreda_id),
            $approved ? 'Report approved by the zone' : 'Report sent back for revision',
            $report->title.($reason ? ' — '.Str::limit($reason, 160) : ''),
            $approved ? 'heroicon-o-check-circle' : 'heroicon-o-arrow-uturn-left',
            $approved ? 'success' : 'danger',
            self::reportUrl($report));
    }

    public static function commentAdded(WoredaReport $report, string $body): void
    {
        $author = Auth::user();
        $recipients = $author?->isWoredaUser()
            ? self::zoneReviewers()
            : self::woredaUsers($report->woreda_id)->merge(self::zoneReviewers())->unique('id');

        self::send($recipients,
            ($author?->name ?? 'Someone').' commented on a report',
            $report->title.' — “'.Str::limit($body, 140).'”',
            'heroicon-o-chat-bubble-left-right', 'gray',
            self::reportUrl($report));
    }

    /** Overdue reminder to one woreda. */
    public static function reportReminder(int $woredaId, string $month): int
    {
        $users = self::woredaUsers($woredaId);
        self::send($users,
            "Reminder: the {$month} report is due",
            'The zone has not received your monthly report yet. Please submit it in the Reports section.',
            'heroicon-o-bell-alert', 'warning',
            WoredaReportResource::getUrl('create', panel: 'admin'));

        return $users->count();
    }

    // ── Plans and circulars ─────────────────────────────────────

    public static function planAssigned(ZonePlan $plan, ?array $woredaIds = null): void
    {
        $ids = $woredaIds ?? $plan->woredas()->pluck('woredas.id')->all();
        if (! $ids) {
            return;
        }
        self::send(self::woredaUsers($ids),
            'New zone plan: '.$plan->title,
            'Period '.$plan->period.($plan->due_date ? ', due '.$plan->due_date->format('j M Y') : '').'. Update your progress on each task.',
            'heroicon-o-clipboard-document-list', 'info',
            ZonePlanResource::getUrl('view', ['record' => $plan], panel: 'admin'));
    }

    public static function circularSent(Circular $circular, ?array $woredaIds = null): void
    {
        $ids = $woredaIds ?? $circular->woredas()->pluck('woredas.id')->all();
        if (! $ids) {
            return;
        }
        $urgent = $circular->priority === 'urgent';
        self::send(self::woredaUsers($ids),
            ($urgent ? 'URGENT circular: ' : 'New circular: ').$circular->title,
            $circular->requires_acknowledgement
                ? 'Please read and acknowledge'.($circular->respond_by ? ' by '.$circular->respond_by->format('j M Y') : '').'.'
                : 'For your information.',
            'heroicon-o-megaphone', $urgent ? 'danger' : 'info',
            CircularResource::getUrl('view', ['record' => $circular], panel: 'admin'));
    }

    public static function circularAcknowledged(Circular $circular, string $woreda, ?string $response): void
    {
        $recipients = self::exceptActor(collect([$circular->createdBy])->filter())->merge(self::zoneReviewers())->unique('id');
        self::send($recipients,
            "{$woreda} acknowledged a circular",
            $circular->title.($response ? ' — “'.Str::limit($response, 140).'”' : ''),
            'heroicon-o-check-badge', 'success',
            CircularResource::getUrl('view', ['record' => $circular], panel: 'admin'));
    }

    // ── Plumbing ────────────────────────────────────────────────

    private static function exceptActor(Collection $users): Collection
    {
        $actor = Auth::id();

        return $users->filter(fn ($u) => $u && $u->id !== $actor && $u->is_active)->values();
    }

    private static function reportUrl(WoredaReport $report): string
    {
        return WoredaReportResource::getUrl('view', ['record' => $report], panel: 'admin');
    }

    private static function send(Collection $users, string $title, string $body, string $icon, string $color, string $url): void
    {
        if ($users->isEmpty()) {
            return;
        }

        Notification::make()
            ->title($title)
            ->body($body)
            ->icon($icon)
            ->iconColor($color)
            ->actions([Action::make('open')->label('Open')->url($url)->markAsRead()])
            ->sendToDatabase($users);
    }
}
