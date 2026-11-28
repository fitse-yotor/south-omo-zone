{{-- Language toggle: EN | አማ shown in the admin top bar --}}
<div class="soz-lang-switcher" style="display:flex;align-items:center;gap:2px;margin-inline:0.5rem;">

    <button
        wire:click="switchTo('en')"
        title="English"
        style="
            padding: 3px 10px;
            border-radius: 9999px 0 0 9999px;
            border: 1px solid rgba(255,255,255,0.25);
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            {{ $locale === 'en'
                ? 'background:#2a55bd;color:#fff;border-color:#2a55bd;'
                : 'background:transparent;color:inherit;border-color:rgba(0,0,0,0.15);' }}
        "
    >EN</button>

    <button
        wire:click="switchTo('am')"
        title="አማርኛ"
        style="
            padding: 3px 10px;
            border-radius: 0 9999px 9999px 0;
            border: 1px solid rgba(255,255,255,0.25);
            font-size: 0.72rem;
            font-weight: 600;
            font-family: 'Noto Sans Ethiopic', sans-serif;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            {{ $locale === 'am'
                ? 'background:#2a55bd;color:#fff;border-color:#2a55bd;'
                : 'background:transparent;color:inherit;border-color:rgba(0,0,0,0.15);' }}
        "
    >አማ</button>

</div>
