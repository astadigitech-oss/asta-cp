<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Support\ContentSanitizer;
use Tests\TestCase;

class SeoRemediationTest extends TestCase
{
    public function test_canonical_domain_redirects_www_to_apex(): void
    {
        $response = $this->get('http://www.astadigitalagency.com/id');

        $response->assertStatus(301);
        $this->assertSame('https://astadigitalagency.com/id', $response->headers->get('Location'));
    }

    public function test_services_page_renders_dedicated_catalog_not_homepage(): void
    {
        // ID Services
        $responseId = $this->get('/id/services');
        $responseId->assertOk();
        $responseId->assertSee('Layanan Rekayasa Digital & Solusi Perangkat Lunak');
        $responseId->assertDontSee('Agensi Digital Yogyakarta · Yogyakarta'); // Homepage eyebrow
        $responseId->assertSee('<link rel="canonical" href="http://127.0.0.1:8000/id/services"', false);

        // EN Services
        $responseEn = $this->get('/en/services');
        $responseEn->assertOk();
        $responseEn->assertSee('Digital Engineering Services & Software Solutions');
        $responseEn->assertDontSee('Website & App Developed as'); // Homepage hero title
        $responseEn->assertSee('<link rel="canonical" href="http://127.0.0.1:8000/en/services"', false);
    }

    public function test_services_page_has_no_title_word_repetition(): void
    {
        $response = $this->get('/id/services');
        $response->assertOk();
        $content = $response->getContent();

        // Title should be: Layanan & Solusi Rekayasa Software — ASTA Digital Agency
        $this->assertStringContainsString('<title>Layanan &amp; Solusi Rekayasa Software — ASTA Digital Agency</title>', $content);
        $this->assertStringNotContainsString('Semua Layanan & Solusi Digital — ASTA Digital Agency', $content);
    }

    public function test_blog_listing_h1_is_descriptive_and_distinct(): void
    {
        $responseId = $this->get('/id/blog');
        $responseId->assertOk();
        $responseId->assertSee('Artikel & Wawasan Rekayasa Perangkat Lunak');

        $responseEn = $this->get('/en/blog');
        $responseEn->assertOk();
        $responseEn->assertSee('Software Engineering & Technology Insights');
    }

    public function test_english_homepage_has_no_typos_and_no_title_word_repetition(): void
    {
        $response = $this->get('/en');
        $response->assertOk();
        $content = html_entity_decode($response->getContent(), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $this->assertStringContainsString('ASTA Digital Agency — Software House & Technology Solutions', $content);
        $this->assertStringNotContainsString('Technology Solutions & Digital Agency', $content);
        $this->assertStringNotContainsString('goverment', $content);
        $this->assertStringNotContainsString('intitutions', $content);
        $this->assertStringContainsString('government', $content);

        // Verify locale dictionary directly contains full corrected phrasing
        $enJson = json_decode(file_get_contents(resource_path('js/locales/en.json')), true);
        $this->assertStringContainsString('government institutions', $enJson['meta']['description']);
    }

    public function test_content_sanitizer_cleans_empty_headings_and_demotes_h1(): void
    {
        $dirtyHtml = '<h1>My Custom Title</h1><h2>&nbsp;</h2><h3>   </h3><p>Normal paragraph.</p><h4>Valid Subtitle</h4>';
        $cleaned = ContentSanitizer::cleanArticleHtml($dirtyHtml, 'My Custom Title');

        // Heading matching title should be stripped
        $this->assertStringNotContainsString('My Custom Title', $cleaned);
        // Empty headings should be stripped
        $this->assertStringNotContainsString('<h2>', $cleaned);
        $this->assertStringNotContainsString('<h3>', $cleaned);
        // Valid subtitle retained
        $this->assertStringContainsString('<h4>Valid Subtitle</h4>', $cleaned);
        $this->assertStringContainsString('<p>Normal paragraph.</p>', $cleaned);
    }

    public function test_content_sanitizer_unwraps_excessively_long_bold_tags(): void
    {
        $longSentence = str_repeat('Kata kunci penting dalam pengembangan software enterprise ', 3); // >100 chars
        $dirty = "<p>Ini adalah <strong>{$longSentence}</strong> dalam teks.</p>";
        $cleaned = ContentSanitizer::cleanArticleHtml($dirty);

        // Bold tags unwrapped because plain text > 100 characters
        $this->assertStringNotContainsString('<strong>', $cleaned);
        $this->assertStringContainsString($longSentence, $cleaned);

        // Short bold retained
        $short = "<p>Ini <strong>kata kunci singkat</strong>.</p>";
        $cleanedShort = ContentSanitizer::cleanArticleHtml($short);
        $this->assertStringContainsString('<strong>kata kunci singkat</strong>', $cleanedShort);
    }

    public function test_content_sanitizer_limits_words_safely_for_serp_pixels(): void
    {
        $longDesc = 'Ini adalah kalimat deskripsi yang sangat panjang sekali dibuat untuk menguji apakah pemotongan karakter bekerja tepat pada batas kata dan tidak memotong kata di tengah huruf demi kenyamanan pembaca.';
        $limited = ContentSanitizer::limitWords($longDesc, 135);

        $this->assertLessThanOrEqual(135, mb_strlen($limited, 'UTF-8'));
        $this->assertStringEndsWith('...', $limited);
    }
}
