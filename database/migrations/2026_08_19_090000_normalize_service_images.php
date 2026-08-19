<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->select('id', 'image')->get()->each(function (object $service): void {
            $images = json_decode($service->image, true);

            if (!is_array($images)) {
                $images = $service->image ? [$service->image] : [];
            }

            DB::table('services')
                ->where('id', $service->id)
                ->update(['image' => json_encode(array_values($images))]);
        });
    }

    public function down(): void
    {
        DB::table('services')->select('id', 'image')->get()->each(function (object $service): void {
            $images = json_decode($service->image, true);
            $image = is_array($images) ? ($images[0] ?? null) : $service->image;

            DB::table('services')
                ->where('id', $service->id)
                ->update(['image' => $image]);
        });
    }
};
