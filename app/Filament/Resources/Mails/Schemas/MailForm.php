<?php

namespace App\Filament\Resources\Mails\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class MailForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Data Sender')
                    ->description('Information of sender')
                    ->icon(Heroicon::UserCircle)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('first_name')
                                    ->required()
                                    ->disabled(),
                                TextInput::make('last_name')
                                    ->disabled()
                                    ->required(),
                                TextInput::make('email')
                                    ->email()
                                    ->disabled()
                                    ->label('API key')
                                    ->copyable(copyMessage: 'Copied!', copyMessageDuration: 1500)
                                    ->required(),
                                TextInput::make('phone')
                                    ->label('API key')
                                    ->disabled()
                                    ->copyable(copyMessage: 'Copied!', copyMessageDuration: 1500)
                                    ->tel(),
                            ])
                    ])->columnSpanFull(),
                Section::make('Status Answered')
                    ->description('Information of status')
                    ->icon(Heroicon::CheckCircle)
                    ->schema([
                        Select::make('status')
                            ->label('Status')
                            ->disabled()
                            ->options([
                                'answered' => 'Answered',
                                'not_answered' => 'Not Answered',
                            ])
                            ->required()
                            ->default('not_answered')
                            ->preload()
                    ])->columnSpanFull(),
                Section::make('Message')
                    ->description('Information of message')
                    ->icon(Heroicon::ChatBubbleLeftRight)
                    ->schema([
                        Textarea::make('message')
                            ->disabled()
                            ->required()
                            ->rows(10),
                    ])->columnSpanFull(),
            ]);
    }
}
