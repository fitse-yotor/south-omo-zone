<x-filament-widgets::widget>
    <x-filament::section icon="heroicon-o-rocket-launch" collapsible
        :heading="'Launch checklist · ' . $doneCount . ' of ' . $total . ' done'"
        description="Placeholders and gaps left from the original content. Click an item to fix it.">
        <div style="height:8px;width:100%;overflow:hidden;border-radius:9999px;background:rgba(127,127,127,.18);margin-bottom:1rem">
            <div style="height:100%;border-radius:9999px;background:rgb(var(--primary-600));width: {{ $total ? round($doneCount / $total * 100) : 100 }}%"></div>
        </div>
        <ul class="divide-y divide-gray-100 dark:divide-white/5">
            @foreach ($items as $item)
                @if ($showDone || ! $item['done'])
                    <li>
                        <a href="{{ $item['url'] }}" class="flex items-start gap-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5" style="padding-inline:.5rem;margin-inline:-.5rem">
                            @if ($item['done'])
                                <x-filament::icon icon="heroicon-s-check-circle" class="mt-0.5 h-5 w-5 shrink-0" style="color: rgb(var(--success-600))" />
                            @else
                                <x-filament::icon icon="heroicon-o-exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0" style="color: rgb(var(--warning-600))" />
                            @endif
                            <span class="min-w-0">
                                <span class="block text-sm font-medium {{ $item['done'] ? 'text-gray-500 line-through' : 'text-gray-950 dark:text-white' }}">{{ $item['label'] }}</span>
                                <span class="block text-sm text-gray-500 dark:text-gray-400">{{ $item['detail'] }}</span>
                            </span>
                        </a>
                    </li>
                @endif
            @endforeach
        </ul>
        <div class="mt-3">
            <x-filament::link tag="button" wire:click="$toggle('showDone')" size="sm">
                {{ $showDone ? 'Hide completed items' : 'Show completed items' }}
            </x-filament::link>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
