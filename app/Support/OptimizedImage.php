<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Throwable;

class OptimizedImage
{
    private const PRESETS = [
        'service-logo' => [
            'directories' => ['images/service', 'images/services', 'service', 'services'],
            'width' => 128,
            'height' => 128,
            'contain' => true,
        ],
        'service-cover' => [
            'directories' => ['images/service', 'images/services', 'service', 'services'],
            'width' => 960,
            'height' => 720,
            'contain' => false,
        ],
        'service-detail' => [
            'directories' => ['images/service', 'images/services', 'service', 'services'],
            'width' => 1280,
            'height' => 960,
            'contain' => false,
        ],
        'portfolio-card' => [
            'directories' => ['images/portfolios', 'images/portfolio', 'portfolios', 'portfolio'],
            'width' => 800,
            'height' => 1000,
            'contain' => false,
        ],
        'portfolio-thumb' => [
            'directories' => ['images/portfolios', 'images/portfolio', 'portfolios', 'portfolio'],
            'width' => 160,
            'height' => 200,
            'contain' => false,
        ],
        'client-logo' => [
            'directories' => ['images/clients', 'images/client', 'clients', 'client'],
            'width' => 260,
            'height' => 100,
            'contain' => true,
        ],
        'discover-logo' => [
            'directories' => ['images/logos', 'images/logo', 'logos', 'logo'],
            'width' => 128,
            'height' => 128,
            'contain' => true,
        ],
        'discover-card' => [
            'directories' => ['images/discovers', 'images/discover', 'discovers', 'discover'],
            'width' => 960,
            'height' => 600,
            'contain' => false,
        ],
        'discover-thumb' => [
            'directories' => ['images/discovers', 'images/discover', 'discovers', 'discover'],
            'width' => 640,
            'height' => 360,
            'contain' => false,
        ],
        'discover-thumb-medium' => [
            'directories' => ['images/discovers', 'images/discover', 'discovers', 'discover'],
            'width' => 432,
            'height' => 243,
            'contain' => false,
        ],
        'discover-section' => [
            'directories' => ['images/elearning', 'images/discovers', 'elearning', 'discovers'],
            'width' => 1200,
            'height' => 900,
            'contain' => false,
        ],
        'testimonial-avatar' => [
            'directories' => ['images/testimonials', 'images/testimonial', 'testimonials', 'testimonial'],
            'width' => 160,
            'height' => 160,
            'contain' => false,
        ],
        'article-thumb' => [
            'directories' => ['articles/covers', 'articles', 'covers'],
            'width' => 1200,
            'height' => 1200,
            'contain' => true,
        ],
        'article-image' => [
            'directories' => ['articles/covers', 'articles/gallery', 'articles/sections', 'articles/content', 'articles'],
            'width' => 1920,
            'height' => 1920,
            'contain' => true,
        ],
        'og-image' => [
            'directories' => ['seo/og', 'seo'],
            'width' => 1200,
            'height' => 630,
            'contain' => false,
        ],
    ];

    public static function presets(): array
    {
        return self::PRESETS;
    }

    public static function normalizePath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $clean = ltrim(str_replace('\\', '/', $path), '/');
        if (str_starts_with($clean, 'storage/')) {
            $clean = substr($clean, strlen('storage/'));
        }

        return $clean;
    }

    public static function version(string $path, string $preset): string
    {
        if (! isset(self::PRESETS[$preset])) {
            throw new \InvalidArgumentException("Unknown image preset [{$preset}].");
        }

        $cleanPath = self::normalizePath($path);
        $disk = Storage::disk('public');

        return sha1(implode('|', [
            $cleanPath,
            $preset,
            'v2',
            $disk->lastModified($cleanPath),
            $disk->size($cleanPath),
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

    public static function generateVariant(string $path, string $preset, ?string $variantPath = null): bool
    {
        $cleanPath = self::normalizePath($path);
        $configuration = self::PRESETS[$preset] ?? null;

        if (! $configuration) {
            return false;
        }

        if (! $variantPath) {
            $presetHash = self::version($cleanPath, $preset);
            $variantPath = "optimized/{$preset}/{$presetHash}.webp";
        }

        return ImageOptimizer::createWebpVariant(
            $cleanPath,
            $variantPath,
            $configuration['width'],
            $configuration['height'],
            $configuration['contain'] ?? false,
            88
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

        $cleanPath = self::normalizePath($path);
        $disk = Storage::disk('public');

        // File SVG disajikan langsung (vector, tidak perlu konversi raster WebP)
        $ext = strtolower(pathinfo($cleanPath, PATHINFO_EXTENSION));
        if ($ext === 'svg') {
            return asset(Storage::url($cleanPath));
        }

        $configuration = self::PRESETS[$preset] ?? null;
        if (! $configuration) {
            return asset(Storage::url($cleanPath));
        }

        $matchesDirectory = false;
        foreach ($configuration['directories'] as $directory) {
            if (str_starts_with($cleanPath, "{$directory}/") && ! str_contains($cleanPath, '..')) {
                $matchesDirectory = true;
                break;
            }
        }

        if (! $matchesDirectory) {
            if (! str_contains($cleanPath, '..') && $disk->exists($cleanPath)) {
                $matchesDirectory = true;
            } else {
                return asset(Storage::url($cleanPath));
            }
        }

        if (! $disk->exists($cleanPath)) {
            return asset(Storage::url($cleanPath));
        }

        $presetHash = self::version($cleanPath, $preset);
        $variantPath = "optimized/{$preset}/{$presetHash}.webp";

        // 1. Jika varian WebP sudah ada di storage publik, langsung return URL static Nginx!
        // Nginx akan menyajikan file ini langsung dari disk via kernel sendfile (0ms overhead PHP).
        if ($disk->exists($variantPath)) {
            return asset("storage/{$variantPath}");
        }

        // 2. Jika belum ada, usahakan generate sekarang juga agar request selanjutnya langsung dilayani Nginx
        if (function_exists('imagewebp')) {
            try {
                if (self::generateVariant($cleanPath, $preset, $variantPath)) {
                    return asset("storage/{$variantPath}");
                }
            } catch (Throwable) {
                // Silently fallback
            }
        }

        // 3. Fallback ke controller dinamis / original
        return route('media.optimized', [
            'preset' => $preset,
            'path' => $cleanPath,
            'v' => $presetHash,
        ]);
    }
}
