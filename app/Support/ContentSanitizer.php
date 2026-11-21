<?php

namespace App\Support;

class ContentSanitizer
{
    /**
     * Normalize text for strict comparison (lowercased, strip tags/entities/special chars).
     */
    public static function normalize(mixed $text): string
    {
        if (empty($text) || !is_scalar($text)) {
            return '';
        }

        $decoded = html_entity_decode(strip_tags((string) $text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        // Replace non-alphanumeric unicode characters with single spaces
        $cleaned = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $decoded);

        return mb_strtolower(trim($cleaned ?? ''), 'UTF-8');
    }

    /**
     * Extract and normalize all possible titles from a string, array, or delimited multilingual string.
     *
     * @return string[]
     */
    public static function extractTitles(mixed $articleTitle): array
    {
        $rawTitles = [];

        if (is_array($articleTitle)) {
            foreach ($articleTitle as $t) {
                $rawTitles = array_merge($rawTitles, self::extractTitles($t));
            }
        } elseif (is_string($articleTitle)) {
            $trimmed = trim($articleTitle);
            if (preg_match('/\[:\s*(id|en)\s*\]/i', $trimmed)) {
                $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $trimmed, -1, PREG_SPLIT_DELIM_CAPTURE);
                for ($i = 1; $i < count($parts); $i += 2) {
                    $val = trim($parts[$i + 1] ?? '');
                    $val = preg_replace('/\[:\s*\]$/', '', $val);
                    if ($val !== '') {
                        $rawTitles[] = $val;
                    }
                }
            } else {
                $rawTitles[] = $trimmed;
            }
        }

        $normalized = [];
        foreach ($rawTitles as $t) {
            $n = self::normalize($t);
            if ($n !== '') {
                $normalized[] = $n;
            }
        }

        return array_values(array_unique($normalized));
    }

    /**
     * Sanitize article HTML body or content section description:
     * 1. Eliminates any heading tag (<h1-6>) that duplicates the article title (prevents h1=h1, h1=h2, h1=h3).
     * 2. Demotes any remaining <h1> tags inside content to <h2> to maintain strict single-H1 hierarchy.
     */
    public static function cleanArticleHtml(mixed $html, mixed $articleTitle = null): mixed
    {
        if (is_array($html)) {
            $cleaned = [];
            foreach ($html as $key => $val) {
                $cleaned[$key] = self::cleanArticleHtml($val, $articleTitle);
            }
            return $cleaned;
        }

        if (!is_string($html) || trim($html) === '') {
            return $html;
        }

        $normalizedTitles = self::extractTitles($articleTitle);

        // 1. Process headings: remove empty headings, demote H1 to H2, remove title duplicates
        $cleanedHtml = preg_replace_callback('/<h([1-6])([^>]*)>(.*?)<\/h\1>/is', function ($matches) use ($normalizedTitles) {
            $tagNum = $matches[1];
            $attrs = $matches[2];
            $content = $matches[3];

            $headingNorm = self::normalize($content);

            // Strip empty headings (e.g. <h2></h2>, <h3>&nbsp;</h3>, <h4> </h4>)
            if ($headingNorm === '') {
                return '';
            }

            // If heading duplicates the article title, remove the entire heading tag to avoid h1=h2 or h1=h1
            if (in_array($headingNorm, $normalizedTitles, true)) {
                return '';
            }

            // Demote any <h1> in content to <h2> so there is strictly one single <h1> on the page
            if ($tagNum === '1') {
                return "<h2{$attrs}>{$content}</h2>";
            }

            return $matches[0];
        }, $html);

        // 2. Remove empty <strong>, <b>, <em>, <i> tags
        $cleanedHtml = preg_replace('/<(strong|b|em|i)[^>]*>\s*(?:&nbsp;)*\s*<\/\1>/is', '', $cleanedHtml);

        // 3. Unwrap excessively long bold/strong tags (> 100 characters) to prevent SERP over-optimization flags
        $cleanedHtml = preg_replace_callback('/<(strong|b)([^>]*)>(.*?)<\/\1>/is', function ($bMatch) {
            $bContent = $bMatch[3];
            $plain = trim(strip_tags(html_entity_decode($bContent, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
            if (mb_strlen($plain, 'UTF-8') > 100) {
                return $bContent;
            }
            return $bMatch[0];
        }, $cleanedHtml);

        // 4. Remove accidental nofollow from internal links (domain astadigitalagency.com or relative paths)
        $cleanedHtml = preg_replace_callback('/<a\b([^>]*)>/i', function ($aMatch) {
            $attrs = $aMatch[1];
            $isInternal = preg_match('/href=[\'"](?:https?:\/\/(?:www\.)?astadigitalagency\.com|\/(?!\/))/i', $attrs);
            if ($isInternal && preg_match('/rel=[\'"][^\'"]*nofollow[^\'"]*[\'"]/i', $attrs)) {
                $attrs = preg_replace_callback('/rel=([\'"])(.*?)\1/i', function ($relMatch) {
                    $q = $relMatch[1];
                    $val = preg_replace('/\bnofollow\b/i', '', $relMatch[2]);
                    $val = trim(preg_replace('/\s+/', ' ', $val));
                    return $val !== '' ? "rel={$q}{$val}{$q}" : '';
                }, $attrs);
            }
            return "<a{$attrs}>";
        }, $cleanedHtml);

        return $cleanedHtml;
    }

    /**
     * Extracts localized text from delimited syntax ([:id]...[:en]...[:] or [id]...[/id]).
     */
    public static function extractDelimitedText(string $text, string $lang = 'id'): string
    {
        $trimmed = trim($text);
        if (!$trimmed) return '';

        if (preg_match('/\[:\s*(id|en)\s*\]/i', $trimmed)) {
            $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $trimmed, -1, PREG_SPLIT_DELIM_CAPTURE);
            $dict = [];
            for ($i = 1; $i < count($parts); $i += 2) {
                $tag = strtolower(trim($parts[$i]));
                $val = trim($parts[$i + 1] ?? '');
                $val = preg_replace('/\[:\s*\]$/', '', $val);
                $dict[$tag] = trim($val);
            }
            if (!empty($dict[$lang])) return $dict[$lang];
            $fallback = $lang === 'id' ? 'en' : 'id';
            if (!empty($dict[$fallback])) return $dict[$fallback];
        }

        if (preg_match('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $trimmed)) {
            preg_match_all('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $trimmed, $matches, PREG_SET_ORDER);
            $dict = [];
            foreach ($matches as $m) {
                $dict[strtolower(trim($m[1]))] = trim($m[2]);
            }
            if (!empty($dict[$lang])) return $dict[$lang];
            $fallback = $lang === 'id' ? 'en' : 'id';
            if (!empty($dict[$fallback])) return $dict[$fallback];
        }

        return $trimmed;
    }

    /**
     * Limits text to a specific length at word boundary without breaking words.
     * Default 135 characters safely fits within Google's ~960-1000px SERP snippet limit.
     */
    public static function limitWords(string $text, int $limit = 135): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));
        if (mb_strlen($text, 'UTF-8') <= $limit) {
            return $text;
        }

        $sub = mb_substr($text, 0, $limit - 3, 'UTF-8');
        $lastSpace = mb_strrpos($sub, ' ', 0, 'UTF-8');
        if ($lastSpace !== false && $lastSpace > ($limit / 2)) {
            $sub = mb_substr($sub, 0, $lastSpace, 'UTF-8');
        }

        return $sub . '...';
    }

    /**
     * Resolves a guaranteed unique meta description per locale.
     * Prevents duplicate descriptions across /id/ and /en/ URLs when content was only inputted in Indonesian.
     */
    public static function resolveLocalizedDescription(
        mixed $rawDesc,
        string $locale,
        ?string $title = null,
        string $type = 'page'
    ): string {
        $descStr = is_string($rawDesc) ? trim($rawDesc) : '';
        if ($descStr === '') {
            return $locale === 'en'
                ? 'PT Asta Digital Agency provides modern web development, mobile apps, and custom software systems.'
                : 'PT Asta Digital Agency membangun aplikasi mobile, website, dan sistem informasi modern untuk perusahaan.';
        }

        $hasDelimiters = preg_match('/\[:\s*(id|en)\s*\]/i', $descStr) || preg_match('/\[\s*(id|en)\s*\]/i', $descStr);

        // If the description does not contain multilingual tags, it was provided directly for this page
        if (!$hasDelimiters) {
            return self::limitWords($descStr, 135);
        }

        $idDesc = trim(strip_tags(self::extractDelimitedText($descStr, 'id')));
        $enDesc = trim(strip_tags(self::extractDelimitedText($descStr, 'en')));

        if ($locale === 'en') {
            // If explicit English translation exists and is distinct from ID, use it
            if ($enDesc !== '' && $enDesc !== $idDesc) {
                return self::limitWords($enDesc, 135);
            }

            // Fallback: Generate an English contextualized description so /en/ is never duplicate of /id/
            $cleanTitle = $title ? trim(strip_tags($title)) : 'ASTA Digital';
            if ($type === 'discover') {
                $enGenerated = "Explore {$cleanTitle} — technology case study and digital transformation insights from ASTA Digital Agency: {$idDesc}";
            } elseif ($type === 'article') {
                $enGenerated = "Read insights on {$cleanTitle} — expert technology analysis and software engineering from ASTA Digital Agency. {$idDesc}";
            } else {
                $enGenerated = "Explore {$cleanTitle} by ASTA Digital Agency: {$idDesc}";
            }

            return self::limitWords($enGenerated, 135);
        }

        // Locale is 'id'
        return self::limitWords($idDesc ?: $descStr, 135);
    }
}
