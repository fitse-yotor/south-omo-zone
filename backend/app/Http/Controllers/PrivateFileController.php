<?php

namespace App\Http\Controllers;

use App\Filament\Resources\CircularResource;
use App\Filament\Resources\WoredaReportResource;
use App\Models\WoredaReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Report and circular files live on the private disk. They are only served here, behind the admin login,
 * and through the same scoped queries as the admin screens: a woreda account reaches its own woreda's
 * reports and the circulars addressed to it, nothing else (others get 404, not even "forbidden").
 */
class PrivateFileController extends Controller
{
    /** Shown in the browser; everything else downloads. */
    private const INLINE = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    public function __invoke(Request $request, string $type, int $id, int $index): StreamedResponse
    {
        [$path, $name] = match ($type) {
            'report' => $this->reportFile($id, $index),
            'circular' => $this->circularFile($id),
            default => abort(404),
        };

        $disk = Storage::disk(WoredaReport::FILES_DISK);
        abort_unless($path && $disk->exists($path), 404);

        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $inline = ! $request->boolean('download') && in_array($extension, self::INLINE, true);
        $headers = ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=600'];
        if ($extension !== 'pdf') {
            // A file can never run script in the admin's origin. (Not for PDFs: Chrome will not show a sandboxed PDF.)
            $headers['Content-Security-Policy'] = 'sandbox';
        }

        return $inline
            ? $disk->response($path, $name, $headers)
            : $disk->download($path, $name, $headers);
    }

    private function reportFile(int $id, int $index): array
    {
        $report = WoredaReportResource::getEloquentQuery()->whereKey($id)->firstOrFail();
        $path = array_values($report->attachments ?? [])[$index] ?? null;

        return [$path, $report->attachment_names[$path] ?? ($path ? basename($path) : null)];
    }

    private function circularFile(int $id): array
    {
        $circular = CircularResource::getEloquentQuery()->whereKey($id)->firstOrFail();
        $path = $circular->attachment;
        $title = preg_replace('/[^\pL\pN ._-]+/u', '', $circular->title) ?: 'circular';

        return [$path, $path ? trim($title).'.'.pathinfo($path, PATHINFO_EXTENSION) : null];
    }
}
