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
     * Create an optimized WebP variant for an image on public storage.
     */
    public static function createWebpVariant(
        string $sourceRelativePath,
        string $variantRelativePath,
        int $targetWidth,
        int $targetHeight,
        bool $contain = false,
        int $quality = 78
    ): bool {
        if (! function_exists('imagewebp')) {
            return false;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($sourceRelativePath)) {
            return false;
        }

        $sourceFullPath = $disk->path($sourceRelativePath);
        $imageInfo = @getimagesize($sourceFullPath);
        if ($imageInfo === false) {
            return false;
        }

        $sourceWidth = $imageInfo[0];
        $sourceHeight = $imageInfo[1];
        $imageType = $imageInfo[2];

        if (! in_array($imageType, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            return false;
        }

        if (! self::isSafeToDecode($sourceWidth, $sourceHeight, false)) {
            return false;
        }

        $source = match ($imageType) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourceFullPath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourceFullPath),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourceFullPath) : false,
            default => false,
        };

        if ($source === false) {
            return false;
        }

        $destinationFullPath = $disk->path($variantRelativePath);
        $destinationDir = dirname($destinationFullPath);
        if (! is_dir($destinationDir) && ! @mkdir($destinationDir, 0755, true) && ! is_dir($destinationDir)) {
            imagedestroy($source);
            return false;
        }

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        if ($canvas === false) {
            imagedestroy($source);
            return false;
        }

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
        imagefill($canvas, 0, 0, $transparent);

        if ($contain) {
            $scale = min($targetWidth / $sourceWidth, $targetHeight / $sourceHeight);
            $newW = max(1, (int) round($sourceWidth * $scale));
            $newH = max(1, (int) round($sourceHeight * $scale));
            $dstX = (int) floor(($targetWidth - $newW) / 2);
            $dstY = (int) floor(($targetHeight - $newH) / 2);

            imagecopyresampled(
                $canvas,
                $source,
                $dstX,
                $dstY,
                0,
                0,
                $newW,
                $newH,
                $sourceWidth,
                $sourceHeight
            );
        } else {
            $targetRatio = $targetWidth / $targetHeight;
            $sourceRatio = $sourceWidth / $sourceHeight;

            if ($sourceRatio > $targetRatio) {
                $cropWidth = (int) round($sourceHeight * $targetRatio);
                $srcX = (int) floor(($sourceWidth - $cropWidth) / 2);
                $srcY = 0;
                $cropHeight = $sourceHeight;
            } else {
                $cropWidth = $sourceWidth;
                $srcX = 0;
                $cropHeight = (int) round($sourceWidth / $targetRatio);
                $srcY = (int) floor(($sourceHeight - $cropHeight) / 2);
            }

            imagecopyresampled(
                $canvas,
                $source,
                0,
                0,
                $srcX,
                $srcY,
                $targetWidth,
                $targetHeight,
                $cropWidth,
                $cropHeight
            );
        }

        $tempPath = $destinationFullPath . '.tmp.' . bin2hex(random_bytes(4));
        $saved = @imagewebp($canvas, $tempPath, $quality);

        imagedestroy($source);
        imagedestroy($canvas);

        if ($saved && file_exists($tempPath)) {
            @chmod($tempPath, 0644);
            return @rename($tempPath, $destinationFullPath);
        }

        if (file_exists($tempPath)) {
            @unlink($tempPath);
        }

        return false;
    }

    /**
     * Inspect SVG file: if it contains an embedded raster base64 bitmap that makes it bloated (>100KB),
     * extract, downscale, compress, and re-embed it.
     */
    public static function optimizeSvgIfBloated(string $relativeSvgPath, int $maxDimension = 520): bool
    {
        $disk = Storage::disk('public');
        if (! $disk->exists($relativeSvgPath)) {
            return false;
        }

        $fullPath = $disk->path($relativeSvgPath);
        $size = @filesize($fullPath);
        if ($size === false || $size < 100_000) {
            return false;
        }

        $content = @file_get_contents($fullPath);
        if (! $content) {
            return false;
        }

        if (preg_match('/data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+\/=\s]+)/i', $content, $matches)) {
            $rawBase64 = preg_replace('/\s+/', '', $matches[2]);
            $decoded = @base64_decode($rawBase64);
            if (! $decoded) {
                return false;
            }

            if (! function_exists('imagecreatefromstring')) {
                return false;
            }

            $gd = @imagecreatefromstring($decoded);
            if (! $gd) {
                return false;
            }

            $origW = imagesx($gd);
            $origH = imagesy($gd);

            if ($origW <= $maxDimension && $origH <= $maxDimension && strlen($decoded) < 150_000) {
                imagedestroy($gd);
                return false;
            }

            $scale = min($maxDimension / $origW, $maxDimension / $origH, 1.0);
            $newW = max(1, (int) round($origW * $scale));
            $newH = max(1, (int) round($origH * $scale));

            $canvas = imagecreatetruecolor($newW, $newH);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
            imagefill($canvas, 0, 0, $transparent);

            imagecopyresampled($canvas, $gd, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

            ob_start();
            imagepng($canvas, null, 8);
            $compressed = ob_get_clean();

            imagedestroy($gd);
            imagedestroy($canvas);

            if ($compressed && strlen($compressed) < strlen($decoded)) {
                $newBase64 = base64_encode($compressed);
                $newContent = str_replace($matches[0], "data:image/png;base64," . $newBase64, $content);
                @file_put_contents($fullPath, $newContent);
                return true;
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
