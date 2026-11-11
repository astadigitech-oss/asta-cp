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
        if ($this->app->environment('production') || request()->header('X-Forwarded-Proto') === 'https') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::useStyleTagAttributes(fn (
            string $src,
            string $url,
            ?array $chunk,
            ?array $manifest,
        ): array => config('app.env') === 'production' ? [
            'media' => 'print',
            'onload' => "this.onload=null;this.media='all'",
        ] : []);

        // Pre-generate optimized WebP variants on model upload/save in Filament admin
        \App\Models\Client::saved(function ($model) {
            if (!empty($model->image)) {
                \App\Support\OptimizedImage::url($model->image, 'client-logo');
            }
        });
        \App\Models\Portfolio::saved(function ($model) {
            if (!empty($model->image)) {
                \App\Support\OptimizedImage::url($model->image, 'portfolio-card');
                \App\Support\OptimizedImage::url($model->image, 'portfolio-thumb');
            }
        });
        \App\Models\Service::saved(function ($model) {
            if (!empty($model->logo)) \App\Support\OptimizedImage::url($model->logo, 'service-logo');
            if (!empty($model->cover_image)) \App\Support\OptimizedImage::url($model->cover_image, 'service-cover');
            if (!empty($model->image) && is_array($model->image)) {
                foreach ($model->image as $img) {
                    if (is_string($img)) \App\Support\OptimizedImage::url($img, 'service-detail');
                }
            }
        });
        \App\Models\Article::saved(function ($model) {
            if (!empty($model->thumbnail)) \App\Support\OptimizedImage::url($model->thumbnail, 'article-thumb');
        });
        \App\Models\Discover::saved(function ($model) {
            if (!empty($model->image)) {
                $imgs = is_array($model->image) ? $model->image : [$model->image];
                foreach ($imgs as $img) {
                    if (is_string($img)) {
                        \App\Support\OptimizedImage::url($img, 'discover-card');
                        \App\Support\OptimizedImage::url($img, 'discover-thumb');
                    }
                }
            }
        });
        \App\Models\Testimonial::saved(function ($model) {
            if (!empty($model->avatar)) \App\Support\OptimizedImage::url($model->avatar, 'testimonial-avatar');
        });
    }
}
