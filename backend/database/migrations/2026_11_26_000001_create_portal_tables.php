<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Portal content. Every visitor-facing text has an English (_en) and Amharic (_am) column.
 * Multi-line fields (highlights, requirements, the leader's message) hold one item per line.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('editor')->after('email'); // admin | editor | notices
            $table->boolean('is_active')->default(true)->after('role');
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('invest_email')->nullable();
            $table->string('tourism_email')->nullable();
            $table->string('address_en')->nullable();
            $table->string('address_am')->nullable();
            $table->string('hours_en')->nullable();
            $table->string('hours_am')->nullable();
            $table->date('road_status_checked_on')->nullable();
            $table->timestamps();
        });

        Schema::create('leader_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_am');
            $table->string('title_en');
            $table->string('title_am');
            $table->string('photo')->nullable();
            $table->string('video_url')->nullable();
            $table->text('excerpt_en');
            $table->text('excerpt_am');
            $table->longText('message_en');
            $table->longText('message_am');
            $table->timestamps();
        });

        Schema::create('sectors', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('icon', 40)->default('Sprout');
            $table->string('image')->nullable(); // built-in photo id
            $table->string('photo')->nullable(); // uploaded photo, replaces the built-in one
            $table->string('title_en');
            $table->string('title_am');
            $table->text('text_en');
            $table->text('text_am');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('woredas', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('image')->nullable(); // built-in photo id
            $table->string('photo')->nullable(); // uploaded photo, replaces the built-in one
            $table->string('name_en');
            $table->string('name_am');
            $table->string('seat_en')->nullable();
            $table->string('seat_am')->nullable();
            $table->string('peoples_en')->nullable();
            $table->string('peoples_am')->nullable();
            $table->string('tagline_en')->nullable();
            $table->string('tagline_am')->nullable();
            $table->text('about_en')->nullable();
            $table->text('about_am')->nullable();
            $table->text('highlights_en')->nullable();
            $table->text('highlights_am')->nullable();
            $table->json('sector_slugs')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('woreda_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sector_id')->constrained()->cascadeOnDelete();
            $table->string('title_en');
            $table->string('title_am');
            $table->text('summary_en');
            $table->text('summary_am');
            $table->unsignedInteger('land_ha')->default(0);
            $table->decimal('investment_usd_m', 8, 2)->default(0);
            $table->unsignedInteger('jobs')->default(0);
            $table->boolean('is_published')->default(true);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('attractions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('image')->nullable(); // built-in photo id
            $table->string('photo')->nullable(); // uploaded photo, replaces the built-in one
            $table->string('title_en');
            $table->string('title_am');
            $table->string('tag_en')->nullable();
            $table->string('tag_am')->nullable();
            $table->text('text_en');
            $table->text('text_am');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('type', 10); // vacancy | tender
            $table->string('reference')->nullable();
            $table->string('title_en');
            $table->string('title_am');
            $table->string('organization_en');
            $table->string('organization_am');
            $table->string('location_en')->nullable();
            $table->string('location_am')->nullable();
            $table->text('summary_en');
            $table->text('summary_am');
            $table->text('details_en')->nullable();
            $table->text('details_am')->nullable();
            $table->string('attachment')->nullable();
            $table->date('posted_on');
            $table->date('deadline');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['is_published', 'deadline']);
        });

        Schema::create('road_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('leg')->unique(); // e.g. "dimeka-turmi", matches the map
            $table->string('status', 10)->default('open'); // open | slow | closed
            $table->string('note_en')->nullable();
            $table->string('note_am')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('desk', 20)->default('general'); // general | invest | tourism
            $table->string('name');
            $table->string('email');
            $table->text('message');
            $table->string('ip', 45)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['contact_messages', 'road_statuses', 'announcements', 'attractions', 'opportunities', 'woredas', 'sectors', 'leader_messages', 'site_settings'] as $t) {
            Schema::dropIfExists($t);
        }
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['role', 'is_active']));
    }
};
