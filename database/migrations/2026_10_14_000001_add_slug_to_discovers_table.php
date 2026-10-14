<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('discovers', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        // Generate slug untuk data discover yang sudah ada
        $discovers = DB::table('discovers')->get();
        foreach ($discovers as $item) {
            $baseName = $item->name;
            if (is_string($baseName) && (str_starts_with($baseName, '{') || str_starts_with($baseName, '['))) {
                $decoded = json_decode($baseName, true);
                if (is_array($decoded)) {
                    $baseName = $decoded['id'] ?? $decoded['en'] ?? reset($decoded) ?? 'discover';
                }
            }

            $slug = Str::slug($baseName ?: 'discover-' . $item->id);
            $checkUnique = DB::table('discovers')->where('slug', $slug)->where('id', '!=', $item->id)->exists();
            if ($checkUnique) {
                $slug .= '-' . $item->id;
            }

            DB::table('discovers')->where('id', $item->id)->update([
                'slug' => $slug,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discovers', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};

