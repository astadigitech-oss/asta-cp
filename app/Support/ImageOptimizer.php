<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Throwable;

class ImageOptimizer
{
    public const MAX_SAFE_WEB_PIXELS = 10_000_000; // ~10 MP max on-the-fly in PHP-FPM
    public const MAX_SAFE_CLI_PIXELS = 25_000_000; // ~25 MP max in CLI
    public const MAX_SAFE_DIMENSION = 8_000;        // Max width or height for safe GD decode
    public const MAX_WEB_DIMENSION = 5_000;         // Max width or height in web requests

    /**
     * Determine whether an image is safe to decode into GD memory without triggering an OOM crash.
     */
    public static function isSafeToDecode(int $width, int $height, bool $isWeb = false): bool
    {
        if ($width <= 0 || $height <= 0) {
            return false;
        }

        $maxDimension = $isWeb ? self::MAX_WEB_DIMENSION : self::MAX_SAFE_DIMENSION;
        if ($width > $maxDimension || $height > $maxDimension) {
            return false;
        }

        $totalPixels = $width * $height;
        $maxPixels = $isWeb ? self::MAX_SAFE_WEB_PIXELS : self::MAX_SAFE_CLI_PIXELS;
        if ($totalPixels > $maxPixels) {
            return false;
        }

        // Estimate uncompressed GD memory (approx 5 bytes per pixel + 16MB base buffer)
        $estimatedBytes = ($totalPixels * 5) + (16 * 1024 * 1024);
        $memoryLimit = self::getMemoryLimitBytes();

        if ($memoryLimit > 0) {
            $currentUsage = memory_get_usage(true);
            $availableMemory = $memoryLimit - $currentUsage;
            // Prevent attempting decode if estimated requirement exceeds 70% of available memory
            if ($estimatedBytes > ($availableMemory * 0.70)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Parse php ini memory_limit string to bytes. Returns -1 for unlimited.
     */
    public static function getMemoryLimitBytes(): int
    {
        $limit = ini_get('memory_limit');
        if (! $limit || $limit === '-1') {
            return -1;
        }

        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit) - 1]);
        $val = (int) $limit;

        return match ($last) {
            'g' => $val * 1024 * 1024 * 1024,
            'm' => $val * 1024 * 1024,
            'k' => $val * 1024,
            default => (int) $limit,
        };
    }

    /**
     * Downscale an image on disk if its dimensions exceed the given max width or height.
     * Preserves aspect ratio, PNG transparency, and WebP transparency.
     */
    public static function downscaleIfOversized(
        string $relativePath,
        int $maxWidth = 1200,
        int $maxHeight = 1200,
        int $quality = 85
    ): bool {
        $disk = Storage::disk('public');

        if (! $disk->exists($relativePath)) {
            return false;
        }

        $fullPath = $disk->path($relativePath);
        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        if (! in_array($ext, ['png', 'jpg', 'jpeg', 'webp'], true)) {
            return false;
        }

        $imageInfo = @getimagesize($fullPath);
        if ($imageInfo === false) {
            return false;
        }

        $origWidth = $imageInfo[0];
        $origHeight = $imageInfo[1];
        $imageType = $imageInfo[2];

        // If already within bounds, nothing to do
        if ($origWidth <= $maxWidth && $origHeight <= $maxHeight) {
            return false;
        }

        // Safety guard: ensure decoding this image will not exhaust available memory
        if (! self::isSafeToDecode($origWidth, $origHeight, false)) {
            return false;
        }

        // Temporarily raise memory limit for CLI or background processing of large images
        $currentLimit = ini_get('memory_limit');
        @ini_set('memory_limit', '1024M');

        try {
            $source = match ($imageType) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($fullPath),
                IMAGETYPE_PNG => @imagecreatefrompng($fullPath),
                IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($fullPath) : false,
                default => false,
            };

            if ($source === false) {
                return false;
            }

            // Calculate scaled dimensions (contain)
            $scale = min($maxWidth / $origWidth, $maxHeight / $origHeight);
            $newWidth = max(1, (int) round($origWidth * $scale));
            $newHeight = max(1, (int) round($origHeight * $scale));

            $canvas = imagecreatetruecolor($newWidth, $newHeight);
            if ($canvas === false) {
                imagedestroy($source);
                return false;
            }

            // Preserve alpha channel for PNG and WebP
            if ($imageType === IMAGETYPE_PNG || $imageType === IMAGETYPE_WEBP) {
                imagealphablending($canvas, false);
                imagesavealpha($canvas, true);
                $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
                imagefill($canvas, 0, 0, $transparent);
            }

            imagecopyresampled(
                $canvas,
                $source,
                0,
                0,
                0,
                0,
                $newWidth,
                $newHeight,
                $origWidth,
                $origHeight
            );

            $tempPath = $fullPath . '.tmp.' . bin2hex(random_bytes(4));

            $saved = match ($imageType) {
                IMAGETYPE_JPEG => imagejpeg($canvas, $tempPath, $quality),
                IMAGETYPE_PNG => imagepng($canvas, $tempPath, 8),
                IMAGETYPE_WEBP => function_exists('imagewebp') ? imagewebp($canvas, $tempPath, $quality) : false,
                default => false,
            };

            imagedestroy($source);
            imagedestroy($canvas);

            if ($saved && file_exists($tempPath)) {
                chmod($tempPath, 0644);
                rename($tempPath, $fullPath);

                // Purge any existing cached variants for this image
                self::purgeVariantsForPath($relativePath);

                return true;
            }

            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
        } catch (Throwable) {
            // Silently fail if GD cannot allocate memory
        } finally {
            if ($currentLimit) {
                @ini_set('memory_limit', $currentLimit);
            }
        }

        return false;
    }

    /**
     * Purge cached variants in storage/optimized for a given relative path
     */
    public static function purgeVariantsForPath(string $relativePath): void
    {
        $disk = Storage::disk('public');
        $optimizedDir = 'optimized';

        if (! $disk->exists($optimizedDir)) {
            return;
        }

        foreach (OptimizedImage::presets() as $preset => $config) {
            try {
                $hash = OptimizedImage::version($relativePath, $preset);
                $variantPath = "optimized/{$preset}/{$hash}.webp";
                if ($disk->exists($variantPath)) {
                    $disk->delete($variantPath);
                }
            } catch (Throwable) {
                // Ignore if path does not match preset
            }
        }
    }
}
