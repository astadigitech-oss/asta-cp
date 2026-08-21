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
                    ->description('General information about the discover entry')
                    ->icon(Heroicon::ClipboardDocumentList)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('logo')
                                    ->label('Logo')
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
                                            ->label('Discover Name')
                                            ->required(),
                                        TextInput::make('year')
                                            ->label('Timeline (Number Format)')
                                            ->placeholder('e.g. 2026/01'),
                                        Toggle::make('show_name')
                                            ->label('Show Name')
                                            ->required()
                                            ->default(true),
                                        Toggle::make('is_pinned')
                                            ->label('Pin to Timeline')
                                            ->helperText('Pinned discoveries will appear at the top of the timeline on the landing page and navbar.')
                                            ->default(false),
                                    ])->columnSpanFull(),
                            ])
                    ])->columnSpanFull(),
                Section::make('Admin Description')
                    ->icon(Heroicon::OutlinedDocumentText)
                    ->description('Internal description notes for admin')
                    ->schema([
                        Textarea::make('short_description')
                            ->label('Short Description')
                            ->helperText('Internal admin description only, will not appear on the main landing page')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),
            ]);
    }
}
