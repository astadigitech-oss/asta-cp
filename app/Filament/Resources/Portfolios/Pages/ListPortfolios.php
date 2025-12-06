<?php

namespace App\Filament\Resources\Portfolios\Pages;

use App\Filament\Resources\Portfolios\PortfolioResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListPortfolios extends ListRecords
{
    protected static string $resource = PortfolioResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'Mobile' => Tab::make()
                ->modifyQueryUsing(fn(Builder $query) => $query->where('type', 'mobile')),
            'Desktop' => Tab::make()
                ->modifyQueryUsing(fn(Builder $query) => $query->where('type', 'desktop')),
        ];
    }
}
