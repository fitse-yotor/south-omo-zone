@php
    /** @var \App\Models\WoredaReport $report */
    $report = $getRecord();
    $files = $report->files();
    $images = $files->where('isImage', true);
    $documents = $files->where('isImage', false);
    $size = fn (?int $b) => $b === null ? 'missing' : ($b >= 1048576 ? number_format($b / 1048576, 1).' MB' : max(1, round($b / 1024)).' KB');
    $icon = fn (string $ext) => match ($ext) {
        'pdf' => 'heroicon-o-document-text',
        'xls', 'xlsx', 'csv' => 'heroicon-o-table-cells',
        'ppt', 'pptx' => 'heroicon-o-presentation-chart-bar',
        default => 'heroicon-o-document',
    };
@endphp

<div class="soz-files">
    @if ($images->isNotEmpty())
        <div class="soz-files-photos">
            @foreach ($images as $file)
                <a href="{{ $file['url'] }}" target="_blank" rel="noopener" class="soz-files-photo" title="{{ $file['name'] }}">
                    <img src="{{ $file['url'] }}" alt="{{ $file['name'] }}" loading="lazy">
                    <span>{{ $file['name'] }}</span>
                </a>
            @endforeach
        </div>
    @endif

    @if ($documents->isNotEmpty())
        <ul class="soz-files-list">
            @foreach ($documents as $file)
                <li>
                    <x-filament::icon :icon="$icon($file['extension'])" class="soz-files-icon h-6 w-6" />
                    <div class="soz-files-meta">
                        <span class="soz-files-name">{{ $file['name'] }}</span>
                        <span class="soz-files-size">{{ strtoupper($file['extension']) }} · {{ $size($file['size']) }}</span>
                    </div>
                    @if ($file['extension'] === 'pdf')
                        <x-filament::link :href="$file['url']" target="_blank" icon="heroicon-m-eye" size="sm">Open</x-filament::link>
                    @endif
                    <x-filament::link :href="$file['url'].'?download=1'" icon="heroicon-m-arrow-down-tray" size="sm">Download</x-filament::link>
                </li>
            @endforeach
        </ul>
    @endif
</div>
