<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
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
    }

    public function test_root_renders_the_saved_locale_without_redirecting(): void
    {
        $this->withCookie('asta_lang', 'en')
            ->get('/')
            ->assertOk()
            ->assertSee('<html lang="en">', false);
    }

    public function test_indonesian_homepage_renders_its_target_keyword_in_metadata_and_content(): void
    {
        $this->get('/id')
            ->assertOk()
            ->assertSee('<script type="module" src=', false)
            ->assertSee('ASTA Digital Agency — Jasa Pembuatan Website Yogyakarta', false)
            ->assertSee('ASTA Digital Agency menyediakan jasa pembuatan website dan aplikasi mobile')
            ->assertSee('ASTA Digital Agency mengerjakan jasa pembuatan website Yogyakarta');
    }
}
