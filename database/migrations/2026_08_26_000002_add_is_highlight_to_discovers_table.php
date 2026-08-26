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
        Schema::table('discovers', function (Blueprint $table) {
            if (!Schema::hasColumn('discovers', 'is_highlight')) {
                $table->boolean('is_highlight')->default(false)->after('is_pinned');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discovers', function (Blueprint $table) {
            if (Schema::hasColumn('discovers', 'is_highlight')) {
                $table->dropColumn('is_highlight');
            }
        });
    }
};

