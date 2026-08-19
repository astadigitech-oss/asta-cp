<?php

use App\Http\Controllers\Api\LandingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/landing', [LandingController::class, 'getLandingData']);
Route::get('/portfolios/{id}', [LandingController::class, 'getPortfolioDetail']);
Route::get('/services/{id}', [LandingController::class, 'getServiceDetail']);
Route::post('/contact', [LandingController::class, 'submitContact']);
