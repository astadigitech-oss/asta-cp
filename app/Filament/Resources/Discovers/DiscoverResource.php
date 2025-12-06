<?php

namespace App\Filament\Resources\Discovers;

use App\Filament\Resources\Discovers\Pages\CreateDiscover;
use App\Filament\Resources\Discovers\Pages\EditDiscover;
use App\Filament\Resources\Discovers\Pages\ListDiscovers;
use App\Filament\Resources\Discovers\RelationManagers\DiscoverListsRelationManager;
use App\Filament\Resources\Discovers\Schemas\DiscoverForm;
use App\Filament\Resources\Discovers\Tables\DiscoversTable;
use App\Models\Discover;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use UnitEnum;

class DiscoverResource extends Resource
{
    protected static ?string $model = Discover::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMagnifyingGlassCircle;

    protected static ?string $recordTitleAttribute = 'Discover';

    protected static string | UnitEnum | null $navigationGroup = 'Klien & Kontak';

    public static function form(Schema $schema): Schema
    {
        return DiscoverForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DiscoversTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            DiscoverListsRelationManager::class
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDiscovers::route('/'),
            'create' => CreateDiscover::route('/create'),
            'edit' => EditDiscover::route('/{record}/edit'),
        ];
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
