<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_root_renders_the_default_locale_without_loading_the_spa(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('<html lang="id">', false)
            ->assertDontSee('<script type="module" src=', false);
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
            ->assertDontSee('<script type="module" src=', false)
            ->assertSee('ASTA Digital Agency — Jasa Pembuatan Website Yogyakarta', false)
            ->assertSee('ASTA Digital Agency menyediakan jasa pembuatan website dan aplikasi mobile')
            ->assertSee('ASTA Digital Agency mengerjakan jasa pembuatan website Yogyakarta');
    }
}
