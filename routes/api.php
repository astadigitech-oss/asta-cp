<?php

use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/landing', [LandingController::class, 'getLandingData']);
Route::get('/portfolios/{id}', [LandingController::class, 'getPortfolioDetail']);
Route::get('/services/{id}', [LandingController::class, 'getServiceDetail']);
Route::get('/discovers/{id}', [LandingController::class, 'getDiscoverDetail']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::post('/contact', [LandingController::class, 'submitContact'])->middleware('throttle:5,1');

// Internal search via Laravel Scout + Meilisearch
// GET /api/search?q=keyword&type=article|discover|service|all&locale=id|en&limit=10
Route::get('/search', SearchController::class)->middleware('throttle:30,1');

