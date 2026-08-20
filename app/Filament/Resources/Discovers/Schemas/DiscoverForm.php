<?php

namespace App\Filament\Resources\Discovers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class DiscoverForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('General Data')
                    ->description('The general data of the discover.')
                    ->icon(Heroicon::ClipboardDocumentList)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('logo')
                                    ->required()
                                    ->disk('public')
                                    ->directory('images/logos'),
                                FileUpload::make('image')
                                    ->label('Background / Timeline Image')
                                    ->disk('public')
                                    ->directory('images/discovers'),
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('name')
                                            ->required(),
                                        TextInput::make('year')
                                            ->label('Timeline (Format Angka)')
                                            ->placeholder('Contoh: 2026/01'),
                                        Toggle::make('show_name')
                                            ->required()
                                            ->default(true),
                                        Toggle::make('is_pinned')
                                            ->label('Pin ke Timeline')
                                            ->helperText('Discovery pinned akan tampil paling atas di timeline landing page dan navbar.')
                                            ->default(false),
                                    ])->columnSpanFull(),
                            ])
                    ])->columnSpanFull(),
                Section::make('Description')
                    ->icon(Heroicon::OutlinedDocumentText)
                    ->description('The description of the discover.')
                    ->schema([
                        Textarea::make('short_description')
                        ->required()
                        ->helperText('Hanya jadi deskripsi admin saja, tidak muncul ke halamna utama')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),
            ]);
    }
}
