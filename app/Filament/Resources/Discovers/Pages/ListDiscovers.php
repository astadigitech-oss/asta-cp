<?php

namespace App\Filament\Resources\Discovers\Pages;

use App\Filament\Resources\Discovers\DiscoverResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;

class ListDiscovers extends ListRecords
{
    protected static string $resource = DiscoverResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Semua')
                ->icon(Heroicon::OutlinedListBullet),
            'story' => Tab::make('Discover Story')
                ->icon(Heroicon::OutlinedNewspaper)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'story')->orWhereNull('type')),
            'elearning' => Tab::make('E-Learning & Blog')
                ->icon(Heroicon::OutlinedAcademicCap)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'elearning')),
        ];
    }
}
