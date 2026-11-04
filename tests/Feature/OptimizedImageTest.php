<?php

namespace Tests\Feature;

use App\Support\OptimizedImage;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OptimizedImageTest extends TestCase
{
    public function test_image_html_attributes_include_preset_dimensions(): void
    {
        $this->assertSame('width="960" height="720"', OptimizedImage::htmlAttributes('service-cover'));
        $this->assertSame('width="640" height="360"', OptimizedImage::htmlAttributes('discover-thumb'));
    }

    public function test_image_urls_use_an_optimized_variant_for_allowed_public_uploads(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('images/service/logo.png', 'image');

        $url = OptimizedImage::url('images/service/logo.png', 'service-logo');

        $this->assertSame(
            route('media.optimized', [
                'preset' => 'service-logo',
                'path' => 'images/service/logo.png',
                'v' => OptimizedImage::version('images/service/logo.png', 'service-logo'),
            ]),
            $url,
        );
    }

    public function test_image_version_changes_when_the_source_file_changes(): void
    {
        Storage::fake('public');
        $path = 'images/service/logo.png';
        Storage::disk('public')->put($path, 'first image');
        $firstVersion = OptimizedImage::version($path, 'service-logo');

        Storage::disk('public')->put($path, 'updated image');

        $this->assertNotSame($firstVersion, OptimizedImage::version($path, 'service-logo'));
    }

    public function test_article_section_images_use_the_article_image_preset(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('articles/sections/inline.png', 'image');

        $this->assertSame(
            route('media.optimized', [
                'preset' => 'article-image',
                'path' => 'articles/sections/inline.png',
                'v' => OptimizedImage::version('articles/sections/inline.png', 'article-image'),
            ]),
            OptimizedImage::url('articles/sections/inline.png', 'article-image'),
        );
    }

    public function test_discover_section_images_use_the_discover_section_preset(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('images/elearning/section.png', 'image');

        $this->assertSame(
            route('media.optimized', [
                'preset' => 'discover-section',
                'path' => 'images/elearning/section.png',
                'v' => OptimizedImage::version('images/elearning/section.png', 'discover-section'),
            ]),
            OptimizedImage::url('images/elearning/section.png', 'discover-section'),
        );
    }

    public function test_external_images_keep_their_original_url(): void
    {
        $url = 'https://images.example.com/logo.png';

        $this->assertSame($url, OptimizedImage::url($url, 'service-logo'));
    }

    public function test_image_endpoint_rejects_unknown_presets_and_disallowed_directories(): void
    {
        $this->get('/media/not-a-preset/images/service/logo.png')->assertNotFound();
        $this->get('/media/service-logo/images/portfolios/project.png')->assertNotFound();
    }

    public function test_image_endpoint_serves_svg_logos_directly_with_long_cache(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('images/service/logo.svg', '<svg></svg>');

        $response = $this->get('/media/service-logo/images/service/logo.svg')->assertOk();

        $this->assertStringContainsString('max-age=31536000', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('immutable', $response->headers->get('Cache-Control'));
        $this->assertSame('image/svg+xml', $response->headers->get('Content-Type'));
    }

    public function test_image_endpoint_serves_oversized_images_directly_with_long_cache(): void
    {
        Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/bS8AAAAASUVORK5CYII=', true);
        $png = substr_replace($png, pack('N', 4000) . pack('N', 4000), 16, 8);
        Storage::disk('public')->put('images/clients/large-logo.png', $png);

        $response = $this->get('/media/client-logo/images/clients/large-logo.png')->assertOk();

        $this->assertStringContainsString('max-age=31536000', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('immutable', $response->headers->get('Cache-Control'));
        $this->assertSame('image/png', $response->headers->get('Content-Type'));
    }

    public function test_image_endpoint_serves_original_when_webp_support_is_unavailable(): void
    {
        if (function_exists('imagewebp')) {
            $this->markTestSkipped('This fallback only applies when GD WebP support is unavailable.');
        }

        Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/bS8AAAAASUVORK5CYII=', true);
        Storage::disk('public')->put('images/service/logo.png', $png);

        $response = $this->get('/media/service-logo/images/service/logo.png')->assertOk();

        $this->assertSame('image/png', $response->headers->get('Content-Type'));
        $this->assertSame($png, $response->baseResponse->getFile()->getContent());
        $this->assertStringContainsString('max-age=31536000', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('immutable', $response->headers->get('Cache-Control'));
    }

    public function test_image_endpoint_creates_a_cached_webp_variant(): void
    {
        if (! function_exists('imagewebp')) {
            $this->markTestSkipped('GD with WebP support is required to generate image variants.');
        }

        Storage::fake('public');
        $source = imagecreatetruecolor(8, 8);
        ob_start();
        imagepng($source);
        $png = ob_get_clean();
        imagedestroy($source);
        Storage::disk('public')->put('images/service/logo.png', $png);

        $response = $this->get('/media/service-logo/images/service/logo.png');
        $response->assertOk();
        $this->assertSame('image/webp', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('max-age=31536000', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('immutable', $response->headers->get('Cache-Control'));
        $this->assertCount(1, Storage::disk('public')->allFiles('optimized/service-logo'));
        $this->assertSame(
            0644,
            fileperms(Storage::disk('public')->path(Storage::disk('public')->allFiles('optimized/service-logo')[0])) & 0777,
        );
    }
}
