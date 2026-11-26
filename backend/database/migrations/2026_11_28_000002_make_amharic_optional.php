<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Amharic is optional in the admin forms (the site falls back to English), but some columns
 * from the first migration were NOT NULL, so saving an English-only notice failed.
 */
return new class extends Migration
{
    protected const COLUMNS = [
        'leader_messages' => ['name_am' => 'string', 'title_am' => 'string', 'excerpt_am' => 'text', 'message_am' => 'longText'],
        'sectors' => ['title_am' => 'string', 'text_am' => 'text'],
        'woredas' => ['name_am' => 'string'],
        'opportunities' => ['title_am' => 'string', 'summary_am' => 'text'],
        'attractions' => ['title_am' => 'string', 'text_am' => 'text'],
        'announcements' => ['title_am' => 'string', 'organization_am' => 'string', 'summary_am' => 'text'],
    ];

    public function up(): void
    {
        foreach (self::COLUMNS as $table => $cols) {
            Schema::table($table, function (Blueprint $t) use ($cols) {
                foreach ($cols as $col => $type) {
                    $t->{$type}($col)->nullable()->change();
                }
            });
        }
    }

    public function down(): void
    {
        // Not reversed: making the columns required again would fail on English-only rows.
    }
};
