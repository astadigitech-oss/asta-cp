<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Client;
use App\Models\Discover;
use App\Models\Mail;
use App\Models\Testimonial;
use App\Mail\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail as Mailer;
use Illuminate\Support\Facades\Storage;

class LandingController extends Controller
{
    /**
     * Helper to get full storage URL for Filament uploaded files
     */
    private function formatImageUrl($path)
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return asset(Storage::url($path));
    }

    /**
     * Retrieve landing page data for React frontend from Filament models
     */
    public function getLandingData()
    {
        $services = Service::with(['serviceListMains' => function ($query) {
            $query->orderBy('sort', 'asc');
        }])->orderBy('sort', 'asc')->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'show_name' => $service->show_name,
                'header' => $service->header,
                'description' => $service->description,
                'short_description' => $service->short_description,
                'logo' => $this->formatImageUrl($service->logo),
                'image' => collect($service->image ?? [])
                    ->map(fn (string $image) => $this->formatImageUrl($image))
                    ->filter()
                    ->values()
                    ->all(),
                'serviceListMains' => $service->serviceListMains,
            ];
        });

        $portfolios = Portfolio::all()->map(function ($portfolio) {
            return [
                'id' => $portfolio->id,
                'name' => $portfolio->name,
                'description' => $portfolio->description,
                'type' => $portfolio->type,
                'category' => $portfolio->type, // Alias for React category filter
                'image' => $this->formatImageUrl($portfolio->image),
                'demo_url' => $portfolio->demo_url,
            ];
        });

        $clients = Client::all()->map(function ($client) {
            return [
                'id' => $client->id,
                'name' => $client->name,
                'image' => $this->formatImageUrl($client->image),
            ];
        });

        $discovers = Discover::with(['DiscoverLists' => function ($query) {
            $query->where('is_active', true)->orderBy('sort', 'asc');
        }])->orderByDesc('is_pinned')->orderByDesc('year')->orderByDesc('created_at')->get()->map(function ($discover) {
            $discoverImages = is_array($discover->image)
                ? $discover->image
                : (is_string($discover->image) && !empty($discover->image)
                    ? (json_decode($discover->image, true) ?: [$discover->image])
                    : []);

            $formattedImages = collect($discoverImages)
                ->map(fn ($img) => is_string($img) ? $this->formatImageUrl($img) : null)
                ->filter()
                ->values()
                ->all();

            $rawSections = is_array($discover->content_sections)
                ? $discover->content_sections
                : (is_string($discover->content_sections) && !empty($discover->content_sections)
                    ? (json_decode($discover->content_sections, true) ?: [])
                    : []);

            $formattedSections = collect($rawSections)->map(function ($section) {
                return [
                    'image' => !empty($section['image']) ? $this->formatImageUrl($section['image']) : null,
                    'description' => $section['description'] ?? '',
                ];
            })->values()->all();

            return [
                'id' => $discover->id,
                'name' => $discover->name,
                'type' => $discover->type ?: 'story',
                'year' => $discover->year,
                'short_description' => $discover->short_description,
                'content_sections' => $formattedSections,
                'show_name' => $discover->show_name,
                'is_pinned' => $discover->is_pinned,
                'is_highlight' => (bool) $discover->is_highlight,
                'logo' => $this->formatImageUrl($discover->logo),
                'image' => $formattedImages,
                'created_at' => $discover->created_at ? $discover->created_at->toISOString() : null,
                'DiscoverLists' => $discover->DiscoverLists,
            ];
        });

        $testimonials = Testimonial::where('is_active', true)
            ->orderBy('sort', 'asc')
            ->get()
            ->map(function ($testimonial) {
                return [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'role' => $testimonial->role,
                    'org' => $testimonial->org,
                    'quote' => $testimonial->quote,
                    'avatar' => $this->formatImageUrl($testimonial->avatar),
                    'tag' => $testimonial->tag,
                    'rating' => $testimonial->rating,
                ];
            });

        return response()->json([
            'services' => $services,
            'portfolios' => $portfolios,
            'clients' => $clients,
            'discovers' => $discovers,
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Retrieve single portfolio detail for React frontend
     */
    public function getPortfolioDetail($id)
    {
        $portfolio = Portfolio::find($id);

        if (!$portfolio) {
            return response()->json([
                'status' => 'error',
                'message' => 'Portfolio not found',
            ], 404);
        }

        return response()->json([
            'id' => $portfolio->id,
            'name' => $portfolio->name,
            'description' => $portfolio->description,
            'type' => $portfolio->type,
            'category' => $portfolio->type,
            'image' => $this->formatImageUrl($portfolio->image),
            'demo_url' => $portfolio->demo_url,
            'created_at' => $portfolio->created_at ? $portfolio->created_at->format('d M Y') : null,
        ]);
    }

    /**
     * Retrieve single service detail for React frontend
     */
    public function getServiceDetail($id)
    {
        $service = Service::with('serviceListMains')->find($id);

        if (!$service) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service not found',
            ], 404);
        }

        return response()->json([
            'id' => $service->id,
            'name' => $service->name,
            'show_name' => $service->show_name,
            'header' => $service->header,
            'description' => $service->description,
            'short_description' => $service->short_description,
            'logo' => $this->formatImageUrl($service->logo),
            'image' => collect($service->image ?? [])
                ->map(fn (string $image) => $this->formatImageUrl($image))
                ->filter()
                ->values()
                ->all(),
            'serviceListMains' => $service->serviceListMains,
        ]);
    }

    /**
     * Retrieve single discover detail for React frontend
     */
    public function getDiscoverDetail($id)
    {
        $discover = Discover::with(['DiscoverLists' => function ($query) {
            $query->where('is_active', true)->orderBy('sort', 'asc');
        }])->find($id);

        if (!$discover) {
            return response()->json([
                'status' => 'error',
                'message' => 'Discover not found',
            ], 404);
        }

        $discoverImages = is_array($discover->image)
            ? $discover->image
            : (is_string($discover->image) && !empty($discover->image)
                ? (json_decode($discover->image, true) ?: [$discover->image])
                : []);

        $formattedImages = collect($discoverImages)
            ->map(fn ($img) => is_string($img) ? $this->formatImageUrl($img) : null)
            ->filter()
            ->values()
            ->all();

        $rawSections = is_array($discover->content_sections)
            ? $discover->content_sections
            : (is_string($discover->content_sections) && !empty($discover->content_sections)
                ? (json_decode($discover->content_sections, true) ?: [])
                : []);

        $formattedSections = collect($rawSections)->map(function ($section) {
            return [
                'image' => !empty($section['image']) ? $this->formatImageUrl($section['image']) : null,
                'description' => $section['description'] ?? '',
            ];
        })->values()->all();

        return response()->json([
            'id' => $discover->id,
            'name' => $discover->name,
            'type' => $discover->type ?: 'story',
            'year' => $discover->year,
            'short_description' => $discover->short_description,
            'content_sections' => $formattedSections,
            'show_name' => $discover->show_name,
            'is_pinned' => $discover->is_pinned,
            'is_highlight' => (bool) $discover->is_highlight,
            'logo' => $this->formatImageUrl($discover->logo),
            'image' => $formattedImages,
            'created_at' => $discover->created_at ? $discover->created_at->toISOString() : null,
            'DiscoverLists' => $discover->DiscoverLists,
        ]);
    }

    /**
     * Store contact message from React frontend into Mail model (Filament)
     */
    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255', // Accept combined name fallback
            'organization' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'required|string|max:5000',
            'website_hp' => 'nullable|string', // Honeypot field
            '_timer' => 'nullable|numeric',    // JS mount timestamp
        ]);

        // 1. Honeypot check: If honeypot is filled, return silent fake success
        if (!empty($validated['website_hp'])) {
            \Illuminate\Support\Facades\Log::info('Spam bot detected via honeypot field', ['ip' => $request->ip()]);
            return response()->json([
                'status' => 'success',
                'message' => __('messages.contact_success'),
            ], 201);
        }

        // 2. Submission speed check: Submitting faster than 2 seconds indicates automated bot
        if (!empty($validated['_timer'])) {
            $renderTimeSeconds = floatval($validated['_timer']) / 1000.0;
            $elapsed = microtime(true) - $renderTimeSeconds;
            if ($elapsed > 0 && $elapsed < 2.0) {
                \Illuminate\Support\Facades\Log::info('Spam bot detected via fast submission', ['ip' => $request->ip(), 'elapsed' => $elapsed]);
                return response()->json([
                    'status' => 'success',
                    'message' => __('messages.contact_success'),
                ], 201);
            }
        }

        // 3. Spam link detection: Reject messages with more than 2 HTTP/HTTPS links
        $urlCount = preg_match_all('/https?:\/\//i', $validated['message']);
        if ($urlCount > 2) {
            \Illuminate\Support\Facades\Log::info('Spam bot detected via excessive links', ['ip' => $request->ip(), 'url_count' => $urlCount]);
            return response()->json([
                'status' => 'success',
                'message' => __('messages.contact_success'),
            ], 201);
        }

        $firstName = $validated['first_name'] ?? $validated['name'] ?? 'Guest';
        $lastName = !empty($validated['last_name']) ? $validated['last_name'] : null;

        $message = $validated['message'];
        if (!empty($validated['organization'])) {
            $message = "Organisasi: {$validated['organization']}\n\n{$message}";
        }

        $mail = Mail::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $validated['email'],
            'phone' => !empty($validated['phone']) ? $validated['phone'] : null,
            'message' => $message,
            'status' => 'not_answered',
        ]);

        try {
            Mailer::to(config('mail.contact_to'))->send(new ContactMessage($mail));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed sending contact notification email: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => __('messages.contact_success'),
            'data' => $mail,
        ], 201);
    }
}
