@php
    /** @var \App\Models\WoredaReport $record */
    $comments = $getRecord()->comments()->with('user.woreda')->get();
@endphp

<div class="soz-thread">
    @forelse ($comments as $comment)
        @php $fromWoreda = $comment->user?->isWoredaUser(); @endphp
        <article @class(['soz-msg', 'soz-msg--woreda' => $fromWoreda, 'soz-msg--zone' => ! $fromWoreda])>
            <header class="soz-msg-head">
                <span class="soz-msg-author">{{ $comment->user?->name ?? 'Former user' }}</span>
                <span class="soz-msg-side">{{ $fromWoreda ? ($comment->user?->woreda?->name_en ?? 'Woreda').' woreda' : 'Zone' }}</span>
                <time class="soz-msg-time" datetime="{{ $comment->created_at->toIso8601String() }}" title="{{ $comment->created_at->format('j M Y, H:i') }}">
                    {{ $comment->created_at->diffForHumans() }}
                </time>
            </header>
            <div class="soz-msg-body">{!! nl2br(e($comment->body)) !!}</div>
        </article>
    @empty
        <p class="soz-thread-empty">No comments yet.</p>
    @endforelse
</div>
