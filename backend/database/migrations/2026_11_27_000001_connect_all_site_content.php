<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Makes the rest of the website editable: home page, facts, markets, peoples, guide texts,
 * tourism towns, stays, road details, journeys, itineraries, interface labels and photo credits.
 * Additive only, so it is safe to run on a site that already has data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $t) {
            foreach (['name', 'admin', 'region', 'capital', 'tagline'] as $f) {
                $t->string($f.'_en')->nullable();
                $t->string($f.'_am')->nullable();
            }
            $t->text('intro_en')->nullable();
            $t->text('intro_am')->nullable();
            $t->json('rainy_months')->nullable(); // 0 = January
        });

        foreach (['sectors', 'woredas', 'attractions'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->string('photo_credit')->nullable()->after('photo'));
        }
        Schema::table('attractions', fn (Blueprint $t) => $t->string('journey_slug')->nullable()->after('slug'));
        Schema::table('road_statuses', function (Blueprint $t) {
            $t->string('surface', 10)->default('gravel')->after('leg'); // asphalt | gravel
            $t->unsignedSmallInteger('minutes')->default(60)->after('surface'); // dry-season drive time, 4×4
        });

        Schema::create('hero_slides', function (Blueprint $t) {
            $t->id();
            $t->string('image')->nullable();
            $t->string('photo')->nullable();
            $t->string('photo_credit')->nullable();
            $t->string('caption_en');
            $t->string('caption_am')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('facts', function (Blueprint $t) {
            $t->id();
            $t->string('value', 40);
            $t->string('label_en');
            $t->string('label_am')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('markets', function (Blueprint $t) {
            $t->id();
            $t->string('place_en');
            $t->string('place_am')->nullable();
            $t->string('woreda_slug')->nullable();
            $t->string('stop_key')->nullable(); // town on the tourism map, if any
            $t->json('days'); // 0 = Sunday … 6 = Saturday
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('peoples', function (Blueprint $t) {
            $t->id();
            $t->string('name_en');
            $t->string('name_am')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('guide_items', function (Blueprint $t) {
            $t->id();
            $t->string('group', 20); // step | principle | etiquette
            $t->string('title_en');
            $t->string('title_am')->nullable();
            $t->text('text_en');
            $t->text('text_am')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
            $t->index(['group', 'sort']);
        });

        Schema::create('route_stops', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique(); // fixed: positions and roads come from the map data
            $t->string('name_en');
            $t->string('name_am')->nullable();
            $t->json('services')->nullable(); // fuel | bank | health | gate
            $t->string('image')->nullable();
            $t->string('photo')->nullable();
            $t->string('photo_credit')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('stays', function (Blueprint $t) {
            $t->id();
            $t->foreignId('route_stop_id')->constrained()->cascadeOnDelete();
            $t->string('name_en');
            $t->string('name_am')->nullable();
            $t->string('type_en')->nullable();
            $t->string('type_am')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('journeys', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('image')->nullable();
            $t->string('photo')->nullable();
            $t->string('photo_credit')->nullable();
            $t->json('stops');
            $t->json('stay_at')->nullable();
            foreach (['name', 'sub'] as $f) {
                $t->string($f.'_en')->nullable();
                $t->string($f.'_am')->nullable();
            }
            foreach (['tip', 'stay_note'] as $f) {
                $t->text($f.'_en')->nullable();
                $t->text($f.'_am')->nullable();
            }
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('itineraries', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->unsignedTinyInteger('start_weekday')->default(1); // 0 = Sunday
            $t->string('image')->nullable();
            $t->string('photo')->nullable();
            $t->string('photo_credit')->nullable();
            foreach (['name', 'sub'] as $f) {
                $t->string($f.'_en')->nullable();
                $t->string($f.'_am')->nullable();
            }
            $t->json('days'); // [{stops: [...], night: key|null, note_en, note_am}]
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('labels', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->text('en')->nullable();
            $t->text('am')->nullable();
            $t->timestamps();
        });

        Schema::create('photo_credits', function (Blueprint $t) {
            $t->id();
            $t->string('photo_id')->unique(); // built-in photo id, e.g. "turmi-hills"
            $t->string('title')->nullable();
            $t->string('author');
            $t->string('license')->nullable();
            $t->string('source_url')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['photo_credits', 'labels', 'itineraries', 'journeys', 'stays', 'route_stops', 'guide_items', 'peoples', 'markets', 'facts', 'hero_slides'] as $t) {
            Schema::dropIfExists($t);
        }
        Schema::table('road_statuses', fn (Blueprint $t) => $t->dropColumn(['surface', 'minutes']));
        Schema::table('attractions', fn (Blueprint $t) => $t->dropColumn('journey_slug'));
        foreach (['sectors', 'woredas', 'attractions'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn('photo_credit'));
        }
        Schema::table('site_settings', fn (Blueprint $t) => $t->dropColumn([
            'name_en', 'name_am', 'admin_en', 'admin_am', 'region_en', 'region_am', 'capital_en', 'capital_am',
            'tagline_en', 'tagline_am', 'intro_en', 'intro_am', 'rainy_months',
        ]));
    }
};
