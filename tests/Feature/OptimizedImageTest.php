<?php

namespace Tests\Feature;

use App\Support\OptimizedImage;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OptimizedImageTest extends TestCase
{
    public function test_image_urls_use_an_optimized_variant_for_allowed_public_uploads(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('images/service/logo.png', 'image');

        $url = OptimizedImage::url('images/service/logo.png', 'service-logo');

        $this->assertSame(
            route('media.optimized', ['preset' => 'service-logo', 'path' => 'images/service/logo.png']),
            $url,
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

    public function test_image_endpoint_keeps_svg_logos_as_original_files(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('images/service/logo.svg', '<svg></svg>');

        $this->get('/media/service-logo/images/service/logo.svg')
            ->assertRedirect(Storage::disk('public')->url('images/service/logo.svg'));
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
        $response->assertRedirect();
        $this->assertStringEndsWith('.webp', $response->headers->get('Location'));
        $this->assertCount(1, Storage::disk('public')->allFiles('optimized/service-logo'));
    }
}
