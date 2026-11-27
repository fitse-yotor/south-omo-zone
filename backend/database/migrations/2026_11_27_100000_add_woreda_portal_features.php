<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Woreda portal features:
 * - Link users to a woreda (woreda_user role)
 * - Woreda reports (submitted by woreda users to the zone)
 * - Zone plans (issued by zone/admin to woredas)
 * - Plan tasks (line items within a plan, for progress tracking)
 */
return new class extends Migration
{
    public function up(): void
    {
        // Add woreda_id link to users (null = zone-level user)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('woreda_id')->nullable()->constrained()->nullOnDelete()->after('role');
        });

        // Reports submitted by woreda accounts to the zone
        Schema::create('woreda_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('woreda_id')->constrained()->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('period');                    // e.g. "Q1 2026", "October 2026"
            $table->string('period_type', 20)->default('monthly'); // monthly | quarterly | annual | custom
            $table->text('summary')->nullable();
            $table->text('achievements')->nullable();
            $table->text('challenges')->nullable();
            $table->text('next_steps')->nullable();
            $table->string('attachment')->nullable();    // uploaded file path
            $table->string('status', 20)->default('submitted'); // submitted | reviewed | approved | rejected
            $table->text('zone_feedback')->nullable();   // zone admin's response
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['woreda_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        // Plans issued by the zone to one or all woredas
        Schema::create('zone_plans', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('period');                    // e.g. "FY 2026/27 Q1"
            $table->string('period_type', 20)->default('quarterly');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('active'); // draft | active | closed
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->index(['status', 'due_date']);
        });

        // Which woredas a plan is assigned to (many-to-many)
        Schema::create('zone_plan_woreda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('woreda_id')->constrained()->cascadeOnDelete();
            $table->unique(['zone_plan_id', 'woreda_id']);
        });

        // Individual tasks / targets within a plan
        Schema::create('plan_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_plan_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('target_value')->default(100);  // e.g. 100 (%)
            $table->string('target_unit', 20)->default('%');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        // Per-woreda progress updates on a plan task
        Schema::create('plan_task_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('woreda_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('progress')->default(0);  // 0-100
            $table->text('note')->nullable();
            $table->foreignId('updated_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['plan_task_id', 'woreda_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_task_progress');
        Schema::dropIfExists('plan_tasks');
        Schema::dropIfExists('zone_plan_woreda');
        Schema::dropIfExists('zone_plans');
        Schema::dropIfExists('woreda_reports');
        Schema::table('users', fn (Blueprint $t) => $t->dropConstrainedForeignId('woreda_id'));
    }
};
