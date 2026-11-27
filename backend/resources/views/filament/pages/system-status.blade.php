<x-filament-panels::page>
    @php
        $icons = ['ok' => 'heroicon-m-check-circle', 'warn' => 'heroicon-m-exclamation-triangle', 'fail' => 'heroicon-m-x-circle', 'info' => 'heroicon-m-information-circle'];
        $labels = ['ok' => 'Good', 'warn' => 'Check', 'fail' => 'Fix now', 'info' => 'OK here'];
    @endphp

    <div class="soz-status-summary">
        @foreach (['fail' => 'need fixing', 'warn' => 'to check', 'ok' => 'good', 'info' => 'fine for now'] as $key => $text)
            <div @class(['soz-status-pill', "soz-status-pill--{$key}"])>
                <x-filament::icon :icon="$icons[$key]" class="h-5 w-5" />
                <span><strong>{{ $summary[$key] }}</strong> {{ $text }}</span>
            </div>
        @endforeach
    </div>

    @foreach ($groups as $group => $checks)
        <x-filament::section :heading="$group" compact>
            <ul class="soz-checks">
                @foreach ($checks as $check)
                    <li @class(['soz-check', "soz-check--{$check['status']}"])>
                        <x-filament::icon :icon="$icons[$check['status']]" class="soz-check-icon h-5 w-5" />
                        <div class="soz-check-text">
                            <div class="soz-check-line">
                                <span class="soz-check-label">{{ $check['label'] }}</span>
                                <span class="soz-check-state">{{ $labels[$check['status']] }}</span>
                            </div>
                            <div class="soz-check-detail">{{ $check['detail'] }}</div>
                            @if ($check['fix'])
                                <div class="soz-check-fix">{{ $check['fix'] }}</div>
                            @endif
                        </div>
                    </li>
                @endforeach
            </ul>
        </x-filament::section>
    @endforeach
</x-filament-panels::page>
