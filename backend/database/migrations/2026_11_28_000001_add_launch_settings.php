<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Logo upload, the "sample listing" notice switch, and a sample flag on notices and opportunities. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $t) {
            $t->string('logo')->nullable();
            $t->boolean('show_sample_notice')->default(true);
            $t->timestamp('amharic_reviewed_at')->nullable();
        });
        foreach (['announcements', 'opportunities'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->boolean('is_sample')->default(false));
        }
    }

    public function down(): void
    {
        foreach (['announcements', 'opportunities'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn('is_sample'));
        }
        Schema::table('site_settings', fn (Blueprint $t) => $t->dropColumn(['logo', 'show_sample_notice', 'amharic_reviewed_at']));
    }
};
