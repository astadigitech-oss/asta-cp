<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Vite;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_root_renders_the_default_locale_and_loads_the_spa(): void
    {
        $response = $this->get('/')
            ->assertOk()
            ->assertSee('<html lang="id">', false)
            ->assertSee('<script type="module" src=', false);

        $this->assertMatchesRegularExpression(
            '/<link rel="stylesheet" href="[^"]*(?:resources\\/css\\/app\\.css|\\/assets\\/app-[^"]+\\.css)"[^>]*>/',
            $response->getContent(),
        );
        $this->assertDoesNotMatchRegularExpression(
            '/<link rel="stylesheet" href="[^"]*(?:resources\\/css\\/app\\.css|\\/assets\\/app-[^"]+\\.css)"[^>]*media="print"/',
            $response->getContent(),
        );
        $this->assertSame(
            1,
            preg_match_all('/<link rel="stylesheet" href="[^"]*(?:resources\\/css\\/app\\.css|\\/assets\\/app-[^"]+\\.css)"[^>]*>/', $response->getContent()),
        );
    }

    public function test_root_renders_the_saved_locale_without_redirecting(): void
    {
        $this->withCookie('asta_lang', 'en')
            ->get('/')
            ->assertOk()
            ->assertSee('<html lang="en">', false);
    }

    public function test_production_stylesheet_does_not_block_rendering(): void
    {
        $originalEnvironment = config('app.env');
        $testHotFile = storage_path('framework/testing/vite-hot-file-'.uniqid());

        try {
            config(['app.env' => 'production']);
            Vite::useHotFile($testHotFile);

            $content = $this->get('/')->assertOk()->getContent();

            $this->assertMatchesRegularExpression(
                '/<link rel="stylesheet" href="[^"]*\\/assets\\/app-[^"]+\\.css"[^>]*media="print" onload="this\\.onload=null;this\\.media=\'all\'"/',
                $content,
            );
            $this->assertMatchesRegularExpression(
                '/<noscript>\\s*<link rel="stylesheet" href="[^"]*\\/assets\\/app-[^"]+\\.css">\\s*<\\/noscript>/',
                $content,
            );
        } finally {
            config(['app.env' => $originalEnvironment]);
            Vite::useHotFile(public_path('hot'));
        }
    }

    public function test_indonesian_homepage_renders_its_target_keyword_in_metadata_and_content(): void
    {
        $robotImageHash = substr(hash_file('sha256', resource_path('js/assets/Hero/Robot.webp')), 0, 12);
        $imageVariants = file_get_contents(resource_path('js/generated/imageVariants.ts'));

        $this->get('/id')
            ->assertOk()
            ->assertSee('<script type="module" src=', false)
            ->assertSee('ASTA Digital Agency — Jasa Pembuatan Website Yogyakarta', false)
            ->assertSee('ASTA Digital Agency menyediakan jasa pembuatan website dan aplikasi mobile')
            ->assertSee('ASTA Digital Agency mengerjakan jasa pembuatan website Yogyakarta')
            ->assertSee("/images/optimized/Hero/Robot-webp-640.avif?v={$robotImageHash}")
            ->assertSee('Pengujian dan serah terima')
            ->assertSee('Konten ini terakhir ditinjau:')
            ->assertSee('dateModified');

        $this->assertFileExists(public_path('images/optimized/Hero/Robot-webp-640.avif'));
        $this->assertStringContainsString(
            "/images/optimized/Hero/Robot-webp-640.avif?v={$robotImageHash} 640w",
            $imageVariants,
        );
    }
}
