<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discovers', function (Blueprint $table) {
            $table->text('image')->nullable()->change();
        });

        DB::table('discovers')->select('id', 'image')->get()->each(function (object $discover): void {
            if (empty($discover->image)) {
                return;
            }

            $images = json_decode($discover->image, true);

            if (!is_array($images)) {
                $images = $discover->image ? [$discover->image] : [];
            }

            DB::table('discovers')
                ->where('id', $discover->id)
                ->update(['image' => json_encode(array_values(array_filter($images)))]);
        });
    }

    public function down(): void
    {
        DB::table('discovers')->select('id', 'image')->get()->each(function (object $discover): void {
            if (empty($discover->image)) {
                return;
            }

            $images = json_decode($discover->image, true);
            $image = is_array($images) ? ($images[0] ?? null) : $discover->image;

            DB::table('discovers')
                ->where('id', $discover->id)
                ->update(['image' => $image]);
        });

        Schema::table('discovers', function (Blueprint $table) {
            $table->string('image')->nullable()->change();
        });
    }
};
