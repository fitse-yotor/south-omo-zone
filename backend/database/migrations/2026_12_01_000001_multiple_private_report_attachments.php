<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Report files: several per report, stored privately (storage/app/private/reports) instead of in the public
 * uploads folder, with the original file names kept for display. Any single attachment from before is moved over.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('woreda_reports', function (Blueprint $table) {
            $table->json('attachments')->nullable()->after('attachment');      // stored paths on the "local" (private) disk
            $table->json('attachment_names')->nullable()->after('attachments'); // stored path => original file name
        });

        foreach (DB::table('woreda_reports')->whereNotNull('attachment')->where('attachment', '!=', '')->get(['id', 'attachment']) as $row) {
            $old = $row->attachment;
            $new = 'reports/'.basename($old);
            if (Storage::disk('uploads')->exists($old)) {
                Storage::disk('local')->writeStream($new, Storage::disk('uploads')->readStream($old));
                Storage::disk('uploads')->delete($old);
            }
            DB::table('woreda_reports')->where('id', $row->id)->update([
                'attachments' => json_encode([$new]),
                'attachment_names' => json_encode([$new => basename($old)]),
            ]);
        }

        Schema::table('woreda_reports', fn (Blueprint $table) => $table->dropColumn('attachment'));

        // Circular attachments move to the private disk too (same path, e.g. circulars/abc.pdf).
        foreach (DB::table('circulars')->whereNotNull('attachment')->where('attachment', '!=', '')->pluck('attachment') as $path) {
            if (Storage::disk('uploads')->exists($path) && ! Storage::disk('local')->exists($path)) {
                Storage::disk('local')->writeStream($path, Storage::disk('uploads')->readStream($path));
                Storage::disk('uploads')->delete($path);
            }
        }
    }

    public function down(): void
    {
        Schema::table('woreda_reports', function (Blueprint $table) {
            $table->string('attachment')->nullable();
            $table->dropColumn(['attachments', 'attachment_names']);
        });
    }
};
