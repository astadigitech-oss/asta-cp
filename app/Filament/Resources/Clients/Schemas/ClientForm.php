<?php

namespace App\Filament\Resources\Clients\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ClientForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                FileUpload::make('image')
                    ->label('Client Logo / Photo')
                    ->required()
                    ->disk('public')
                    ->directory('images/clients')
                    ->image(),
                TextInput::make('name')
                    ->label('Client / Company Name')
                    ->required(),
            ]);
    }
}
