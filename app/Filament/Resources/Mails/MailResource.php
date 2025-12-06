<?php

namespace App\Filament\Resources\Mails;

use App\Filament\Resources\Mails\Pages\CreateMail;
use App\Filament\Resources\Mails\Pages\EditMail;
use App\Filament\Resources\Mails\Pages\ListMails;
use App\Filament\Resources\Mails\Schemas\MailForm;
use App\Filament\Resources\Mails\Tables\MailsTable;
use App\Models\Mail;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use UnitEnum;

class MailResource extends Resource
{
    protected static ?string $model = Mail::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedEnvelopeOpen;

    protected static ?string $recordTitleAttribute = 'Pesan';

    protected static string | UnitEnum | null $navigationGroup = 'Klien & Kontak';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'not_answered')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return static::getModel()::where('status', 'not_answered')->count() > 0 ? 'danger' : 'primary';
    }

    public static function form(Schema $schema): Schema
    {
        return MailForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MailsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMails::route('/'),
            'create' => CreateMail::route('/create'),
            'edit' => EditMail::route('/{record}/edit'),
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
