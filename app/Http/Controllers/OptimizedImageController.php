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
        $cleanPath = OptimizedImage::normalizePath($path);

        if (
            str_contains($cleanPath, '..')
            || ! $disk->exists($cleanPath)
        ) {
            abort(404);
        }

        $sourcePath = $disk->path($cleanPath);
        $ext = strtolower(pathinfo($cleanPath, PATHINFO_EXTENSION));

        if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            return $this->cachedFileResponse(
                $sourcePath,
                $disk->mimeType($cleanPath) ?: 'application/octet-stream',
            );
        }

        $presetHash = OptimizedImage::version($cleanPath, $preset);
        $variantPath = "optimized/{$preset}/{$presetHash}.webp";

        if ($disk->exists($variantPath)) {
            return $this->cachedFileResponse($disk->path($variantPath), 'image/webp');
        }

        if (function_exists('imagewebp')) {
            if (OptimizedImage::generateVariant($cleanPath, $preset, $variantPath)) {
                return $this->cachedFileResponse($disk->path($variantPath), 'image/webp');
            }
        }

        return $this->cachedFileResponse(
            $sourcePath,
            $disk->mimeType($cleanPath) ?: 'application/octet-stream',
        );
    }

    public function serveOptimizedStorage(string $preset, string $filename): BinaryFileResponse
    {
        $configuration = OptimizedImage::presets()[$preset] ?? abort(404);
        $disk = Storage::disk('public');
        $variantPath = "optimized/{$preset}/{$filename}";

        if ($disk->exists($variantPath)) {
            return $this->cachedFileResponse($disk->path($variantPath), 'image/webp');
        }

        $targetHash = pathinfo($filename, PATHINFO_FILENAME);

        foreach ($configuration['directories'] as $directory) {
            if (! $disk->exists($directory)) {
                continue;
            }
            $files = $disk->files($directory);
            foreach ($files as $file) {
                try {
                    if (OptimizedImage::version($file, $preset) === $targetHash) {
                        OptimizedImage::generateVariant($file, $preset, $variantPath);
                        if ($disk->exists($variantPath)) {
                            return $this->cachedFileResponse($disk->path($variantPath), 'image/webp');
                        }
                    }
                } catch (\Throwable) {
                    continue;
                }
            }
        }

        abort(404);
    }

    private function cachedFileResponse(string $path, string $contentType): BinaryFileResponse
    {
        return response()->file($path, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Content-Type' => $contentType,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
