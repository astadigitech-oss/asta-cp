<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    private function formatImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return asset('storage/' . ltrim($path, '/'));
    }

    /**
     * Get paginated list of published articles.
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 9);
        $category = $request->query('category');
        $search = $request->query('search');

        $query = Article::query()
            ->where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            })
            ->latest('published_at');

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $articles = $query->paginate($limit)->through(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'thumbnail' => $this->formatImageUrl($article->thumbnail),
                'excerpt' => $article->excerpt,
                'author' => $article->author ?? 'ASTA Digital Team',
                'category' => $article->category ?? 'General',
                'published_at' => $article->published_at?->format('d M Y') ?? $article->created_at->format('d M Y'),
            ];
        });

        return response()->json($articles);
    }

    /**
     * Get single article detail with full Rankbeam SEO metadata & modular sections.
     */
    public function show(string $slug): JsonResponse
    {
        $decoded = urldecode($slug);
        $slugified = \Illuminate\Support\Str::slug($decoded);

        $article = Article::where('is_published', true)
            ->where(function ($q) use ($slug, $decoded, $slugified) {
                $q->where('slug', $slug)
                  ->orWhere('slug', $decoded)
                  ->orWhere('slug', $slugified);

                if (is_numeric($slug)) {
                    $q->orWhere('id', (int) $slug);
                }
            })
            ->first();

        if (!$article) {
            return response()->json([
                'status' => 'error',
                'message' => 'Article not found',
            ], 404);
        }

        // Ambil resolved SEO data dari Rankbeam
        $seo = null;
        try {
            $seo = $article->seoData();
        } catch (\Throwable $e) {
            // Fallback
        }

        $thumbnailUrl = $this->formatImageUrl($article->thumbnail);
        $rawImages = is_array($article->images) ? $article->images : [];
        $formattedImages = collect($rawImages)
            ->map(fn ($img) => $this->formatImageUrl($img))
            ->filter()
            ->values()
            ->all();

        // If thumbnail exists and not in images array, prepend it
        if ($thumbnailUrl && !in_array($thumbnailUrl, $formattedImages)) {
            array_unshift($formattedImages, $thumbnailUrl);
        }

        $rawSections = is_array($article->content_sections) ? $article->content_sections : [];
        $formattedSections = collect($rawSections)->map(function ($section) {
            return [
                'media_type' => $section['media_type'] ?? (!empty($section['video_url']) ? 'video' : (!empty($section['image']) ? 'image' : 'none')),
                'image' => !empty($section['image']) ? $this->formatImageUrl($section['image']) : null,
                'video_url' => $section['video_url'] ?? null,
                'description' => $section['description'] ?? '',
            ];
        })->values()->all();

        $canonicalUrl = $seo?->canonical ?? url('/' . $article->slug);

        // Keywords string formatting
        $keywords = '';
        if ($seo && !empty($seo->focusKeywords)) {
            $keywords = collect($seo->focusKeywords)
                ->map(fn ($k) => is_array($k) ? ($k['keyword'] ?? '') : (is_object($k) ? ($k->keyword ?? '') : (string) $k))
                ->filter()
                ->implode(', ');
        }

        return response()->json([
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'thumbnail' => $thumbnailUrl,
            'images' => $formattedImages,
            'excerpt' => $article->excerpt,
            'body' => $article->body,
            'content_sections' => $formattedSections,
            'author' => $article->author ?? 'ASTA Digital Team',
            'category' => $article->category ?? 'General',
            'published_at' => $article->published_at?->format('d M Y') ?? $article->created_at->format('d M Y'),
            'published_at_iso' => $article->published_at?->toIso8601String() ?? $article->created_at->toIso8601String(),
            'updated_at_iso' => $article->updated_at?->toIso8601String(),
            'seo' => [
                'meta_title' => $seo?->title ?? $article->title,
                'meta_description' => $seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? '')),
                'canonical_url' => $canonicalUrl,
                'robots' => $seo?->robots ?? 'index, follow',
                'og_title' => $seo?->ogTitle ?? ($seo?->title ?? $article->title),
                'og_description' => $seo?->ogDescription ?? ($seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? ''))),
                'og_image' => $seo?->ogImage ?? ($formattedImages[0] ?? $thumbnailUrl),
                'og_type' => $seo?->ogType ?? 'article',
                'twitter_card' => 'summary_large_image',
                'twitter_title' => $seo?->twitterTitle ?? ($seo?->title ?? $article->title),
                'twitter_description' => $seo?->twitterDescription ?? ($seo?->description ?? ($article->excerpt ?: strip_tags($article->body ?? ''))),
                'twitter_image' => $seo?->twitterImage ?? ($formattedImages[0] ?? $thumbnailUrl),
                'keywords' => $keywords,
                'schema_jsonld' => $seo?->schemaJsonld,
            ],
        ]);
    }
}
