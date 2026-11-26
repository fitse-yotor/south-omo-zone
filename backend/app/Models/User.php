<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * admin   – everything, including users and settings
     * editor  – all portal content
     * notices – vacancies, tenders and contact messages only (HR and procurement staff)
     */
    public const ROLES = ['admin' => 'Administrator', 'editor' => 'Content editor', 'notices' => 'Vacancies & tenders only'];

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'is_active' => 'boolean'];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /** Whether this user may manage general portal content (not just notices). */
    public function canEditContent(): bool
    {
        return in_array($this->role, ['admin', 'editor'], true);
    }
}
