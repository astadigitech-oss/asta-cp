<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Discover;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Unified search endpoint untuk frontend React.
     *
     * GET /api/search?q={query}&type={article|discover|service|all}&locale={id|en}&limit={int}
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query  = trim($request->string('q'));
        $type   = $request->string('type', 'all');
        $locale = in_array($request->string('locale'), ['id', 'en']) ? (string) $request->string('locale') : 'id';
        $limit  = min((int) $request->integer('limit', 10), 50);

        if (strlen($query) < 2) {
            return response()->json([
                'query'   => $query,
                'results' => [],
                'total'   => 0,
            ]);
        }

        $results = collect();

        if (in_array($type, ['all', 'article'])) {
            $articles = Article::search($query)
                ->where('is_published', 1)
                ->take($limit)
                ->get()
                ->map(fn ($item) => $this->formatArticle($item, $locale));
            $results = $results->merge($articles);
        }

        if (in_array($type, ['all', 'discover'])) {
            $discovers = Discover::search($query)
                ->take($limit)
                ->get()
                ->map(fn ($item) => $this->formatDiscover($item, $locale));
            $results = $results->merge($discovers);
        }

        if (in_array($type, ['all', 'service'])) {
            $services = Service::search($query)
                ->take($limit)
                ->get()
                ->map(fn ($item) => $this->formatService($item, $locale));
            $results = $results->merge($services);
        }

        return response()->json([
            'query'   => $query,
            'results' => $results->values(),
            'total'   => $results->count(),
        ]);
    }

    private function formatArticle(Article $article, string $locale): array
    {
        $title   = is_array($article->title)
            ? ($article->title[$locale] ?? $article->title['id'] ?? $article->title['en'] ?? '')
            : (string) $article->title;

        $excerpt = is_array($article->excerpt)
            ? ($article->excerpt[$locale] ?? $article->excerpt['id'] ?? $article->excerpt['en'] ?? '')
            : (string) $article->excerpt;

        $slug = $article->getLocalizedSlug($locale);

        return [
            'id'        => $article->id,
            'type'      => 'article',
            'title'     => strip_tags($title),
            'excerpt'   => strip_tags($excerpt),
            'url'       => url("/{$locale}/{$slug}"),
            'thumbnail' => $article->thumbnail ? asset('storage/' . $article->thumbnail) : null,
            'category'  => $article->category,
            'author'    => $article->author,
        ];
    }

    private function formatDiscover(Discover $discover, string $locale): array
    {
        $name = is_array($discover->name)
            ? ($discover->name[$locale] ?? $discover->name['id'] ?? $discover->name['en'] ?? '')
            : (string) $discover->name;

        $desc = is_array($discover->short_description)
            ? ($discover->short_description[$locale] ?? $discover->short_description['id'] ?? $discover->short_description['en'] ?? '')
            : (string) $discover->short_description;

        $slug = $discover->getLocalizedSlug($locale);

        return [
            'id'          => $discover->id,
            'type'        => 'discover',
            'title'       => strip_tags($name),
            'excerpt'     => strip_tags($desc),
            'url'         => url("/{$locale}/discover/{$slug}"),
            'thumbnail'   => $discover->logo ? asset('storage/' . $discover->logo) : null,
            'discover_type' => $discover->type,
        ];
    }

    private function formatService(Service $service, string $locale): array
    {
        $name = is_array($service->name)
            ? ($service->name[$locale] ?? $service->name['id'] ?? $service->name['en'] ?? '')
            : (string) $service->name;

        $desc = is_array($service->short_description)
            ? ($service->short_description[$locale] ?? $service->short_description['id'] ?? $service->short_description['en'] ?? '')
            : (string) $service->short_description;

        return [
            'id'        => $service->id,
            'type'      => 'service',
            'title'     => strip_tags($name),
            'excerpt'   => strip_tags($desc),
            'url'       => url('/'),
            'thumbnail' => $service->logo ? asset('storage/' . $service->logo) : null,
            'header'    => $service->header,
        ];
    }
}

