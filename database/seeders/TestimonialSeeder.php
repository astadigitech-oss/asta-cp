<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Surya Aditama',
                'role' => 'Head of IT',
                'org' => 'Dinas Kominfo',
                'quote' => 'Kencana Digital delivered a portal that meets our stringent government standards and remains a genuine pleasure to use for our staff — day after day.',
                'tag' => 'Government',
                'rating' => 5,
                'sort' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Ratih Pratiwi',
                'role' => 'Director',
                'org' => 'PT Mitra Andalan',
                'quote' => 'Clear communication and premium execution. Our internal systems are dramatically more efficient, auditable, and our team actually enjoys using them now.',
                'tag' => 'Enterprise',
                'rating' => 5,
                'sort' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Hendra Wijaya',
                'role' => 'Principal',
                'org' => 'SMA Negeri 1',
                'quote' => 'The school MIS fundamentally transformed how our teachers, parents, and administration collaborate. A truly enterprise-grade product built with real empathy.',
                'tag' => 'Education',
                'rating' => 5,
                'sort' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $data) {
            Testimonial::firstOrCreate(
                ['name' => $data['name'], 'org' => $data['org']],
                $data
            );
        }
    }
}
