<?php

namespace App\Http\Controllers;

use App\Support\ImageOptimizer;
use App\Support\OptimizedImage;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OptimizedImageController extends Controller
{
    public function __invoke(string $preset, string $path): BinaryFileResponse
    {
        $configuration = OptimizedImage::presets()[$preset] ?? abort(404);
        $disk = Storage::disk('public');

        if (
            str_contains($path, '..')
            || ! collect($configuration['directories'])->contains(fn (string $directory) => str_starts_with($path, "{$directory}/"))
            || ! $disk->exists($path)
        ) {
            abort(404);
        }

        $sourcePath = $disk->path($path);

        if (! in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp'], true)) {
            return $this->cachedFileResponse(
                $disk->path($path),
                $disk->mimeType($path) ?: 'application/octet-stream',
            );
        }

        $imageInfo = getimagesize($sourcePath);

        if ($imageInfo === false) {
            abort(415, 'The requested file is not a supported image.');
        }

        if (! in_array($imageInfo[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            return $this->cachedFileResponse(
                $sourcePath,
                image_type_to_mime_type($imageInfo[2]),
            );
        }

        $sourceWidth = $imageInfo[0];
        $sourceHeight = $imageInfo[1];

        if ($sourceWidth * $sourceHeight > 12_000_000) {
            // Attempt a safe downscale of the oversized source
            if (ImageOptimizer::downscaleIfOversized($path, max(1200, $configuration['width'] * 2), max(900, $configuration['height'] * 2))) {
                clearstatcache(true, $sourcePath);
                $imageInfo = @getimagesize($sourcePath);
                if ($imageInfo !== false) {
                    $sourceWidth = $imageInfo[0];
                    $sourceHeight = $imageInfo[1];
                }
            }

            if ($sourceWidth * $sourceHeight > 12_000_000) {
                return $this->cachedFileResponse(
                    $sourcePath,
                    image_type_to_mime_type($imageInfo[2]),
                );
            }
        }

        if (! function_exists('imagewebp')) {
            return $this->cachedFileResponse(
                $sourcePath,
                image_type_to_mime_type($imageInfo[2]),
            );
        }

        $presetHash = OptimizedImage::version($path, $preset);
        $variantPath = "optimized/{$preset}/{$presetHash}.webp";

        if (! $disk->exists($variantPath)) {
            $lockDirectory = dirname($disk->path("optimized/.locks/{$presetHash}.lock"));

            if (! is_dir($lockDirectory) && ! mkdir($lockDirectory, 0755, true) && ! is_dir($lockDirectory)) {
                throw new RuntimeException('Unable to create the optimized image lock directory.');
            }

            $lock = fopen($lockDirectory . DIRECTORY_SEPARATOR . "{$presetHash}.lock", 'c');

            if ($lock === false) {
                throw new RuntimeException('Unable to lock the optimized image cache.');
            }

            try {
                if (! flock($lock, LOCK_EX)) {
                    throw new RuntimeException('Unable to lock the optimized image cache.');
                }

                try {
                    if (! $disk->exists($variantPath)) {
                        $this->createVariant(
                            $sourcePath,
                            $disk->path($variantPath),
                            $sourceWidth,
                            $sourceHeight,
                            $imageInfo[2],
                            $configuration['width'],
                            $configuration['height'],
                            $preset,
                        );
                    }
                } finally {
                    flock($lock, LOCK_UN);
                }
            } finally {
                fclose($lock);
            }
        }

        return $this->cachedFileResponse($disk->path($variantPath), 'image/webp');
    }

    private function cachedFileResponse(string $path, string $contentType): BinaryFileResponse
    {
        return response()->file($path, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Content-Type' => $contentType,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function createVariant(
        string $sourcePath,
        string $destinationPath,
        int $sourceWidth,
        int $sourceHeight,
        int $imageType,
        int $targetWidth,
        int $targetHeight,
        string $preset,
    ): void {
        $source = match ($imageType) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => imagecreatefromwebp($sourcePath),
            default => false,
        };

        if ($source === false) {
            abort(415, 'The requested image could not be decoded.');
        }

        $destinationDirectory = dirname($destinationPath);

        if (! is_dir($destinationDirectory) && ! mkdir($destinationDirectory, 0755, true) && ! is_dir($destinationDirectory)) {
            imagedestroy($source);
            throw new RuntimeException('Unable to create the optimized image cache directory.');
        }

        $destination = imagecreatetruecolor($targetWidth, $targetHeight);

        if ($destination === false) {
            imagedestroy($source);
            throw new RuntimeException('Unable to allocate the optimized image canvas.');
        }

        imagealphablending($destination, false);
        imagesavealpha($destination, true);
        $transparent = imagecolorallocatealpha($destination, 0, 0, 0, 127);
        imagefill($destination, 0, 0, $transparent);

        if ($preset === 'service-logo' || $preset === 'client-logo' || $preset === 'discover-logo') {
            $scale = min($targetWidth / $sourceWidth, $targetHeight / $sourceHeight);
            $width = max(1, (int) round($sourceWidth * $scale));
            $height = max(1, (int) round($sourceHeight * $scale));
            $destinationX = (int) floor(($targetWidth - $width) / 2);
            $destinationY = (int) floor(($targetHeight - $height) / 2);

            imagecopyresampled(
                $destination,
                $source,
                $destinationX,
                $destinationY,
                0,
                0,
                $width,
                $height,
                $sourceWidth,
                $sourceHeight,
            );
        } else {
            $targetRatio = $targetWidth / $targetHeight;
            $sourceRatio = $sourceWidth / $sourceHeight;

            if ($sourceRatio > $targetRatio) {
                $cropWidth = (int) round($sourceHeight * $targetRatio);
                $sourceX = (int) floor(($sourceWidth - $cropWidth) / 2);
                $sourceY = 0;
                $cropHeight = $sourceHeight;
            } else {
                $cropWidth = $sourceWidth;
                $sourceX = 0;
                $cropHeight = (int) round($sourceWidth / $targetRatio);
                $sourceY = (int) floor(($sourceHeight - $cropHeight) / 2);
            }

            imagecopyresampled(
                $destination,
                $source,
                0,
                0,
                $sourceX,
                $sourceY,
                $targetWidth,
                $targetHeight,
                $cropWidth,
                $cropHeight,
            );
        }

        $temporaryPath = tempnam($destinationDirectory, '.optimized-');

        if ($temporaryPath === false) {
            imagedestroy($source);
            imagedestroy($destination);
            throw new RuntimeException('Unable to create a temporary optimized image.');
        }

        try {
            if (! chmod($temporaryPath, 0644)) {
                throw new RuntimeException('Unable to set permissions on the optimized image.');
            }

            if (! imagewebp($destination, $temporaryPath, 78)) {
                throw new RuntimeException('Unable to encode the optimized image as WebP.');
            }

            if (! rename($temporaryPath, $destinationPath)) {
                throw new RuntimeException('Unable to save the optimized image.');
            }
        } finally {
            if (is_file($temporaryPath)) {
                unlink($temporaryPath);
            }

            imagedestroy($source);
            imagedestroy($destination);
        }
    }
}
