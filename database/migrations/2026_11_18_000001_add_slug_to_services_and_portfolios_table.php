<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Service;
use App\Models\Portfolio;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        // Backfill slugs for existing service records
        Service::withTrashed()->each(function ($service) {
            $name = is_array($service->name)
                ? ($service->name['id'] ?? $service->name['en'] ?? 'service')
                : (string) $service->name;
            $base = Str::slug($name) ?: 'service';
            $slug = $base;
            $i = 1;
            while (Service::withTrashed()->where('slug', $slug)->where('id', '!=', $service->id)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $service->timestamps = false;
            $service->slug = $slug;
            $service->save();
        });

        // Backfill slugs for existing portfolio records
        Portfolio::withTrashed()->each(function ($portfolio) {
            $name = is_array($portfolio->name)
                ? ($portfolio->name['id'] ?? $portfolio->name['en'] ?? 'portfolio')
                : (string) $portfolio->name;
            $base = Str::slug($name) ?: 'portfolio';
            $slug = $base;
            $i = 1;
            while (Portfolio::withTrashed()->where('slug', $slug)->where('id', '!=', $portfolio->id)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $portfolio->timestamps = false;
            $portfolio->slug = $slug;
            $portfolio->save();
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
