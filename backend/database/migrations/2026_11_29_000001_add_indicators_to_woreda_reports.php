<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Figures on woreda reports, so the dashboard can add them up for the zone.
 * - period_start: first day of the month a monthly report covers (what the dashboard groups by)
 * - one nullable number per indicator (blank = not reported); labels and units are in App\Support\Indicators
 */
return new class extends Migration
{
    private const COLUMNS = [
        'investment_projects', 'investment_capital', 'jobs_created',
        'cultivated_ha', 'crop_production_qt', 'livestock_vaccinated',
        'tourists', 'tourism_revenue', 'revenue_collected',
    ];

    public function up(): void
    {
        Schema::table('woreda_reports', function (Blueprint $table) {
            $table->date('period_start')->nullable()->after('period_type');
            foreach (self::COLUMNS as $column) {
                $table->decimal($column, 14, 2)->nullable();
            }
            $table->index(['period_type', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::table('woreda_reports', function (Blueprint $table) {
            $table->dropIndex(['period_type', 'period_start']);
            $table->dropColumn(['period_start', ...self::COLUMNS]);
        });
    }
};
