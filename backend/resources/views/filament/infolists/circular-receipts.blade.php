@php
    /** @var \App\Models\Circular $circular */
    $circular = $getRecord();
    $woredas = $circular->woredas;
@endphp

<div class="soz-receipts">
    <table>
        <thead>
            <tr>
                <th>Woreda</th>
                <th>Opened</th>
                <th>{{ $circular->requires_acknowledgement ? 'Acknowledged' : 'Acknowledgement' }}</th>
                <th>Reply</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($woredas as $woreda)
                @php $p = $woreda->pivot; @endphp
                <tr>
                    <td class="soz-receipts-name">{{ $woreda->name_en }}</td>
                    <td>
                        @if ($p->read_at)
                            {{ \Carbon\Carbon::parse($p->read_at)->format('j M, H:i') }}
                        @else
                            <x-filament::badge color="danger" icon="heroicon-m-envelope">Not opened</x-filament::badge>
                        @endif
                    </td>
                    <td>
                        @if (! $circular->requires_acknowledgement)
                            <span class="soz-muted">Not needed</span>
                        @elseif ($p->acknowledged_at)
                            <x-filament::badge color="success" icon="heroicon-m-check-badge">{{ \Carbon\Carbon::parse($p->acknowledged_at)->format('j M, H:i') }}</x-filament::badge>
                        @else
                            <x-filament::badge color="warning" icon="heroicon-m-clock">Waiting</x-filament::badge>
                        @endif
                    </td>
                    <td class="soz-receipts-reply">{{ $p->response ?: '—' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
