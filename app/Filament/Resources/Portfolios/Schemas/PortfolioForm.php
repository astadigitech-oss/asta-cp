<?php

namespace App\Filament\Resources\Portfolios\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class PortfolioForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Data General')
                    ->description('Información general portfolio')
                    ->icon(Heroicon::DocumentText)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('image')
                                    ->image()
                                    ->disk('public')
                                    ->directory('images/portfolios')
                                    ->required(),
                                Grid::make(1)
                                    ->schema([
                                        TextInput::make('name')
                                            ->required(),
                                        Select::make('type')
                                            ->options(['mobile' => 'Mobile', 'desktop' => 'Desktop'])
                                            ->default('mobile')
                                            ->required(),
                                    ])
                            ])
                    ])->columnSpanFull(),
                Section::make('Descripción')
                    ->description('Descripción del portfolio')
                    ->icon(Heroicon::DocumentText)
                    ->schema([
                        RichEditor::make('description')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull()
            ]);
    }
}
