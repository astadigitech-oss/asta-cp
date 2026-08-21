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
                Section::make('Sender Information')
                    ->description('Sender contact details')
                    ->icon(Heroicon::UserCircle)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('first_name')
                                    ->label('First Name')
                                    ->required()
                                    ->disabled(),
                                TextInput::make('last_name')
                                    ->label('Last Name')
                                    ->disabled(),
                                TextInput::make('email')
                                    ->email()
                                    ->disabled()
                                    ->label('Email Address')
                                    ->copyable(copyMessage: 'Copied!', copyMessageDuration: 1500)
                                    ->required(),
                                TextInput::make('phone')
                                    ->label('Phone Number')
                                    ->disabled()
                                    ->copyable(copyMessage: 'Copied!', copyMessageDuration: 1500)
                                    ->tel(),
                            ])
                    ])->columnSpanFull(),
                Section::make('Message Status')
                    ->description('Message response status')
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
                Section::make('Message Content')
                    ->description('Incoming message details')
                    ->icon(Heroicon::ChatBubbleLeftRight)
                    ->schema([
                        Textarea::make('message')
                            ->label('Message')
                            ->disabled()
                            ->required()
                            ->rows(10),
                    ])->columnSpanFull(),
            ]);
    }
}
