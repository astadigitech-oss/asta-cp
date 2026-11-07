<?php

namespace App\Console\Commands;

use App\Support\ImageOptimizer;
use App\Support\OptimizedImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DownscaleStorageImagesCommand extends Command
{
    protected $signature = 'images:downscale-storage {--force : Force processing all images}';
    protected $description = 'Downscale oversized original uploaded images in public storage to reduce enormous network payloads.';

    /**
     * Preset directories and their maximum target bounding boxes
     */
    private const DIRECTORY_LIMITS = [
        'images/clients' => ['width' => 520, 'height' => 200],
        'images/service' => ['width' => 1280, 'height' => 960],
        'images/portfolios' => ['width' => 1000, 'height' => 1000],
        'images/logos' => ['width' => 320, 'height' => 320],
        'images/discovers' => ['width' => 1200, 'height' => 800],
        'images/elearning' => ['width' => 1200, 'height' => 900],
        'images/testimonials' => ['width' => 320, 'height' => 320],
        'articles/covers' => ['width' => 1200, 'height' => 800],
        'articles/gallery' => ['width' => 1200, 'height' => 800],
        'articles/sections' => ['width' => 1200, 'height' => 900],
    ];

    public function handle(): int
    {
        $disk = Storage::disk('public');
        $this->info('Scanning public storage for oversized images...');

        $processed = 0;
        $totalBytesSaved = 0;

        foreach (self::DIRECTORY_LIMITS as $directory => $limits) {
            if (! $disk->exists($directory)) {
                continue;
            }

            $files = $disk->allFiles($directory);

            foreach ($files as $file) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
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

                if ($w > $limits['width'] || $h > $limits['height']) {
                    $originalSize = @filesize($fullPath) ?: 0;
                    $this->line("  Downscaling: {$file} ({$w}x{$h}, " . round($originalSize / 1024) . ' KB)');

                    $downscaled = ImageOptimizer::downscaleIfOversized(
                        $file,
                        $limits['width'],
                        $limits['height']
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
                    } else {
                        $this->warn("   -> Skipped or could not downscale {$file}");
                    }
                }
            }
        }

        $this->newLine();
        $this->info("Completed: {$processed} images downscaled. Total saved: " . round($totalBytesSaved / 1024) . ' KB.');

        return Command::SUCCESS;
    }
}
