<?php

use App\Livewire\Src\Discover\Index as DiscoverIndex;
use App\Livewire\Src\Home\Index;
use App\Livewire\Src\ProductService\Index as ProductServiceIndex;
use App\Livewire\Src\Portfolio\Index as PortfolioIndex;
use App\Livewire\Src\ProductService\Detail;
use Illuminate\Support\Facades\Route;

Route::get('/', Index::class)->name('home');
Route::get('/product-service', ProductServiceIndex::class)->name('product-service');
Route::get('/product-service/{id}', Detail::class)->name('detail');
Route::get('/portfolio', PortfolioIndex::class)->name('portfolio');
Route::get('/discover', DiscoverIndex::class)->name('discover');
