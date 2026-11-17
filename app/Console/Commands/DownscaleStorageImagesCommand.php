<?php

namespace App\Console\Commands;

use App\Support\ImageOptimizer;
use App\Support\OptimizedImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Throwable;

class DownscaleStorageImagesCommand extends Command
{
    protected $signature = 'images:downscale-storage {--force : Force processing all images}';
    protected $description = 'Downscale oversized original uploaded images and pre-generate WebP variants in public storage.';

    /**
     * Preset directories, limits and their associated presets
     */
    private const DIRECTORY_CONFIG = [
        'images/clients' => [
            'width' => 520,
            'height' => 200,
            'presets' => ['client-logo'],
        ],
        'images/service' => [
            'width' => 1280,
            'height' => 960,
            'presets' => ['service-logo', 'service-cover', 'service-detail'],
        ],
        'images/portfolios' => [
            'width' => 1000,
            'height' => 1000,
            'presets' => ['portfolio-card', 'portfolio-thumb'],
        ],
        'images/logos' => [
            'width' => 320,
            'height' => 320,
            'presets' => ['discover-logo'],
        ],
        'images/discovers' => [
            'width' => 1200,
            'height' => 800,
            'presets' => ['discover-card', 'discover-thumb', 'discover-thumb-medium'],
        ],
        'images/elearning' => [
            'width' => 1200,
            'height' => 900,
            'presets' => ['discover-section'],
        ],
        'images/testimonials' => [
            'width' => 320,
            'height' => 320,
            'presets' => ['testimonial-avatar'],
        ],
        'articles/covers' => [
            'width' => 1200,
            'height' => 800,
            'presets' => ['article-thumb', 'article-image'],
        ],
        'articles/gallery' => [
            'width' => 1200,
            'height' => 800,
            'presets' => ['article-image'],
        ],
        'articles/sections' => [
            'width' => 1200,
            'height' => 900,
            'presets' => ['article-image'],
        ],
        'seo/og' => [
            'width' => 1200,
            'height' => 630,
            'presets' => ['og-image'],
        ],
    ];

    public function handle(): int
    {
        @ini_set('memory_limit', '1536M');
        $disk = Storage::disk('public');
        $this->info('Scanning public storage for image optimization...');

        $processed = 0;
        $variantsGenerated = 0;
        $totalBytesSaved = 0;

        foreach (self::DIRECTORY_CONFIG as $directory => $config) {
            if (! $disk->exists($directory)) {
                continue;
            }

            $files = $disk->allFiles($directory);

            foreach ($files as $file) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

                // 1. Optimize bloated SVG files (e.g. SVGs that embed huge base64 bitmaps)
                if ($ext === 'svg') {
                    if (ImageOptimizer::optimizeSvgIfBloated($file, $config['width'])) {
                        $this->info("  [SVG Optimized]: {$file}");
                        $processed++;
                    }
                    continue;
                }

                if (! in_array($ext, ['png', 'jpg', 'jpeg', 'webp'], true)) {
                    continue;
                }

                $fullPath = $disk->path($file);
                $info = @getimagesize($fullPath);
                if ($info === false) {
                    continue;
                }

                $w = $info[0];
                $h = $info[1];

                // 2. Downscale oversized original images
                if ($w > $config['width'] || $h > $config['height']) {
                    $originalSize = @filesize($fullPath) ?: 0;

                    if (ImageOptimizer::isSafeToDecode($w, $h, false)) {
                        $this->line("  Downscaling: {$file} ({$w}x{$h}, " . round($originalSize / 1024) . ' KB)');

                        $downscaled = ImageOptimizer::downscaleIfOversized(
                            $file,
                            $config['width'],
                            $config['height']
                        );

                        if ($downscaled) {
                            clearstatcache(true, $fullPath);
                            $newSize = @filesize($fullPath) ?: 0;
                            $saved = max(0, $originalSize - $newSize);
                            $totalBytesSaved += $saved;
                            $processed++;

                            $newInfo = @getimagesize($fullPath);
                            $nw = $newInfo ? $newInfo[0] : '?';
                            $nh = $newInfo ? $newInfo[1] : '?';
                            $this->info("   -> Downscaled to {$nw}x{$nh} (" . round($newSize / 1024) . ' KB, saved ' . round($saved / 1024) . ' KB)');
                        }
                    }
                }

                // 3. Pre-generate WebP variants for each applicable preset
                if (function_exists('imagewebp')) {
                    foreach ($config['presets'] as $preset) {
                        try {
                            $hash = OptimizedImage::version($file, $preset);
                            $variantPath = "optimized/{$preset}/{$hash}.webp";

                            if (! $disk->exists($variantPath) || $this->option('force')) {
                                if (OptimizedImage::generateVariant($file, $preset, $variantPath)) {
                                    $variantsGenerated++;
                                }
                            }
                        } catch (Throwable) {
                            // Silently continue
                        }
                    }
                }
            }
        }

        $this->newLine();
        $this->info("Completed: {$processed} images downscaled/optimized, {$variantsGenerated} WebP variants pre-generated. Total saved: " . round($totalBytesSaved / 1024) . ' KB.');

        return Command::SUCCESS;
    }
}
