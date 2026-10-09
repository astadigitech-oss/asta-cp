<?php

use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\ArticleController;
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

