<?php

namespace Tests\Feature;

use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingTrustTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_api_publishes_active_testimonials_without_requiring_a_public_source(): void
    {
        Testimonial::create([
            'name' => 'No source reviewer',
            'quote' => 'A customer-approved review without a public link.',
            'is_active' => true,
            'is_verified' => false,
        ]);
        Testimonial::create([
            'name' => 'Unverified linked reviewer',
            'quote' => 'A review with an optional public link.',
            'source_url' => 'https://example.com/reviews/optional',
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
        Testimonial::create([
            'name' => 'Inactive reviewer',
            'quote' => 'This review is not published.',
            'is_active' => false,
            'is_verified' => true,
        ]);

        $this->getJson('/api/landing')
            ->assertOk()
            ->assertJsonCount(3, 'testimonials')
            ->assertJsonPath('testimonials.0.name', 'No source reviewer')
            ->assertJsonPath('testimonials.0.source_url', null)
            ->assertJsonFragment([
                'name' => 'Unverified linked reviewer',
                'source_url' => 'https://example.com/reviews/optional',
            ])
            ->assertJsonFragment([
                'name' => 'Invalid source reviewer',
                'source_url' => null,
            ])
            ->assertJsonMissing(['name' => 'Inactive reviewer']);
    }

    public function test_homepage_displays_active_testimonials_without_public_sources(): void
    {
        Testimonial::create([
            'name' => 'Active reviewer',
            'quote' => 'A customer-approved review without a public link.',
            'is_active' => true,
            'is_verified' => false,
        ]);
        Testimonial::create([
            'name' => 'Inactive reviewer',
            'quote' => 'This review is not published.',
            'source_url' => null,
            'is_active' => false,
            'is_verified' => false,
        ]);

        $this->get('/id')
            ->assertOk()
            ->assertSee('Active reviewer')
            ->assertDontSee('Inactive reviewer')
            ->assertDontSee('98%')
            ->assertDontSee('20+');
    }
}
