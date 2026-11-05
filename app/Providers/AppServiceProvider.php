<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::useStyleTagAttributes(fn (
            string $src,
            string $url,
            ?array $chunk,
            ?array $manifest,
        ): array => config('app.env') === 'production' ? [
            'media' => 'print',
            'onload' => "this.onload=null;this.media='all'",
        ] : []);
    }
}
