<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - React SPA Frontend Fallback
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    return view('layouts.app');
})->where('any', '^(?!dapur-belakang|admin|api|storage).*');
