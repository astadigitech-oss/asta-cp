<?php

namespace Tests\Feature;

use App\Models\Mail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_submission_saves_to_database(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'org' => 'Asta Corp',
            'email' => 'budi@example.com',
            'phone' => '08123456789',
            'message' => 'Saya ingin berkonsultasi mengenai pembuatan web.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('mails', [
            'first_name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '08123456789',
            'status' => 'not_answered',
        ]);
    }

    public function test_contact_submission_without_phone_or_last_name(): void
    {
        $payload = [
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'message' => 'Pesan tanpa phone',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201);
    }
}
