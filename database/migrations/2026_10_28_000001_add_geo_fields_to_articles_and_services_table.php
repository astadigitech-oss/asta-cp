<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (!Schema::hasColumn('articles', 'tldr_summary')) {
                    $table->json('tldr_summary')->nullable()->after('excerpt');
                }
                if (!Schema::hasColumn('articles', 'faqs')) {
                    $table->json('faqs')->nullable()->after('content_sections');
                }
            });
        }

        if (Schema::hasTable('services')) {
            Schema::table('services', function (Blueprint $table) {
                if (!Schema::hasColumn('services', 'faqs')) {
                    $table->json('faqs')->nullable()->after('description');
                }
                if (!Schema::hasColumn('services', 'comparison_data')) {
                    $table->json('comparison_data')->nullable()->after('faqs');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                $columns = [];
                if (Schema::hasColumn('articles', 'tldr_summary')) {
                    $columns[] = 'tldr_summary';
                }
                if (Schema::hasColumn('articles', 'faqs')) {
                    $columns[] = 'faqs';
                }
                if (!empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }

        if (Schema::hasTable('services')) {
            Schema::table('services', function (Blueprint $table) {
                $columns = [];
                if (Schema::hasColumn('services', 'faqs')) {
                    $columns[] = 'faqs';
                }
                if (Schema::hasColumn('services', 'comparison_data')) {
                    $columns[] = 'comparison_data';
                }
                if (!empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};

