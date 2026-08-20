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
        Schema::create('mails', function (Blueprint $table) {
            $table->uuid('id')->primary();
                $table->string('first_name');
                $table->string('last_name')->nullable();
                $table->string('phone')->nullable();
                $table->string('email');
                $table->text('message');
                $table->enum('status', ['answered', 'not_answered'])->default('not_answered');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mails');
    }
};
