<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

/**
 * EN ⇄ AM toggle shown in the admin top bar.
 * Persists the choice on the user record so it survives login sessions.
 */
class LanguageSwitcher extends Component
{
    public string $locale = 'en';

    public function mount(): void
    {
        $this->locale = Auth::user()?->locale ?? app()->getLocale();
    }

    public function switchTo(string $locale): void
    {
        if (! in_array($locale, ['en', 'am'], true)) {
            return;
        }

        $this->locale = $locale;
        app()->setLocale($locale);

        if ($user = Auth::user()) {
            $user->forceFill(['locale' => $locale])->save();
        }

        // Full page reload so all server-rendered strings re-render in the new language
        $this->redirect(request()->header('Referer') ?? url()->current());
    }

    public function render()
    {
        return view('livewire.language-switcher');
    }
}
