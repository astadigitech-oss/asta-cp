<?php

namespace App\Filament\Resources\Discovers\Pages;

use App\Filament\Resources\Discovers\DiscoverResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDiscovers extends ListRecords
{
    protected static string $resource = DiscoverResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
