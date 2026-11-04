<?php

namespace Tests\Feature;

use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingTrustTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_api_only_publishes_active_verified_testimonials_with_public_sources(): void
    {
        Testimonial::create([
            'name' => 'Verified reviewer',
            'quote' => 'A published customer review.',
            'source_url' => 'https://example.com/reviews/verified',
            'is_active' => true,
            'is_verified' => true,
        ]);
        Testimonial::create([
            'name' => 'Unverified reviewer',
            'quote' => 'This quote has not been checked.',
            'source_url' => 'https://example.com/reviews/unverified',
            'is_active' => true,
            'is_verified' => false,
        ]);
        Testimonial::create([
            'name' => 'Invalid source reviewer',
            'quote' => 'This source is not a public URL.',
            'source_url' => 'javascript:alert(1)',
            'is_active' => true,
            'is_verified' => true,
        ]);

        $this->getJson('/api/landing')
            ->assertOk()
            ->assertJsonCount(1, 'testimonials')
            ->assertJsonPath('testimonials.0.name', 'Verified reviewer')
            ->assertJsonPath('testimonials.0.source_url', 'https://example.com/reviews/verified');
    }

    public function test_homepage_hides_unverified_testimonials_and_unsubstantiated_metrics(): void
    {
        Testimonial::create([
            'name' => 'Verified reviewer',
            'quote' => 'A published customer review.',
            'source_url' => 'https://example.com/reviews/verified',
            'is_active' => true,
            'is_verified' => true,
        ]);
        Testimonial::create([
            'name' => 'Unverified reviewer',
            'quote' => 'This quote has not been checked.',
            'source_url' => null,
            'is_active' => true,
            'is_verified' => false,
        ]);

        $this->get('/id')
            ->assertOk()
            ->assertSee('Verified reviewer')
            ->assertDontSee('Unverified reviewer')
            ->assertDontSee('98%')
            ->assertDontSee('20+');
    }
}
