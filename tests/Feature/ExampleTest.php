<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_indonesian_homepage_renders_its_target_keyword_in_metadata_and_content(): void
    {
        $this->get('/id')
            ->assertOk()
            ->assertSee('ASTA Digital Agency — Jasa Pembuatan Website &amp; Aplikasi', false)
            ->assertSee('Jasa Pembuatan Website, Aplikasi Mobile, dan Sistem Informasi')
            ->assertSee('ASTA Digital Agency melayani jasa pembuatan website company profile');
    }
}
