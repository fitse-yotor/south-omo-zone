<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Communication between the zone and the woredas:
 * - notifications: Laravel's standard table, behind the bell in the admin panel
 * - circulars: directives / memos from the zone, sent to all or some woredas
 * - circular_woreda: per woreda, when it was read and acknowledged (and an optional reply)
 * - report_comments: a discussion thread on each woreda report
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }

        Schema::create('circulars', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no', 60)->nullable();      // the zone's letter number, e.g. "SOZ/ADM/1234/19"
            $table->string('title');
            $table->text('body');
            $table->string('priority', 20)->default('normal');   // normal | urgent
            $table->boolean('requires_acknowledgement')->default(true);
            $table->date('respond_by')->nullable();
            $table->string('attachment')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('circular_woreda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('circular_id')->constrained()->cascadeOnDelete();
            $table->foreignId('woreda_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('response')->nullable();
            $table->unique(['circular_id', 'woreda_id']);
        });

        Schema::create('report_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('woreda_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index(['woreda_report_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_comments');
        Schema::dropIfExists('circular_woreda');
        Schema::dropIfExists('circulars');
        Schema::dropIfExists('notifications');
    }
};
