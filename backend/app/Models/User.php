<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
     * woreda  – woreda-level account: submit reports, view assigned plans
     */
    public const ROLES = [
        'admin'   => 'Administrator',
        'editor'  => 'Content editor',
        'notices' => 'Vacancies & tenders only',
        'woreda'  => 'Woreda account',
    ];

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'woreda_id'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'is_active' => 'boolean'];
    }

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isWoredaUser(): bool
    {
        return $this->role === 'woreda';
    }

    /** Whether this user may manage general portal content (not just notices). */
    public function canEditContent(): bool
    {
        return in_array($this->role, ['admin', 'editor'], true);
    }

    /** Whether this user is a zone-level staff member (not a woreda account). */
    public function isZoneStaff(): bool
    {
        return in_array($this->role, ['admin', 'editor', 'notices'], true);
    }
}
