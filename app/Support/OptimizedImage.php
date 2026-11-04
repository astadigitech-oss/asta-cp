<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class OptimizedImage
{
    private const PRESETS = [
        'service-logo' => ['directories' => ['images/service'], 'width' => 128, 'height' => 128],
        'service-cover' => ['directories' => ['images/service'], 'width' => 960, 'height' => 720],
        'service-detail' => ['directories' => ['images/service'], 'width' => 1280, 'height' => 960],
        'portfolio-card' => ['directories' => ['images/portfolios'], 'width' => 800, 'height' => 1000],
        'portfolio-thumb' => ['directories' => ['images/portfolios'], 'width' => 160, 'height' => 200],
        'client-logo' => ['directories' => ['images/clients'], 'width' => 260, 'height' => 100],
        'discover-logo' => ['directories' => ['images/logos'], 'width' => 128, 'height' => 128],
        'discover-card' => ['directories' => ['images/discovers'], 'width' => 960, 'height' => 600],
        'discover-thumb' => ['directories' => ['images/discovers'], 'width' => 640, 'height' => 360],
        'discover-section' => ['directories' => ['images/elearning'], 'width' => 1200, 'height' => 900],
        'testimonial-avatar' => ['directories' => ['images/testimonials'], 'width' => 160, 'height' => 160],
        'article-thumb' => ['directories' => ['articles/covers'], 'width' => 960, 'height' => 600],
        'article-image' => ['directories' => ['articles/covers', 'articles/gallery', 'articles/sections'], 'width' => 1200, 'height' => 900],
    ];

    public static function presets(): array
    {
        return self::PRESETS;
    }

    public static function version(string $path, string $preset): string
    {
        if (! isset(self::PRESETS[$preset])) {
            throw new \InvalidArgumentException("Unknown image preset [{$preset}].");
        }

        $disk = Storage::disk('public');

        return sha1(implode('|', [
            $path,
            $preset,
            $disk->lastModified($path),
            $disk->size($path),
        ]));
    }

    public static function htmlAttributes(string $preset): string
    {
        $configuration = self::PRESETS[$preset] ?? null;

        if (! $configuration) {
            throw new \InvalidArgumentException("Unknown image preset [{$preset}].");
        }

        return sprintf(
            'width="%d" height="%d"',
            $configuration['width'],
            $configuration['height'],
        );
    }

    public static function url(?string $path, string $preset): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $configuration = self::PRESETS[$preset] ?? null;

        if (! $configuration) {
            throw new \InvalidArgumentException("Unknown image preset [{$preset}].");
        }

        foreach ($configuration['directories'] as $directory) {
            if (
                str_starts_with($path, "{$directory}/")
                && ! str_contains($path, '..')
                && Storage::disk('public')->exists($path)
            ) {
                return route('media.optimized', [
                    'preset' => $preset,
                    'path' => $path,
                    'v' => self::version($path, $preset),
                ]);
            }
        }

        return asset(Storage::url($path));
    }
}
