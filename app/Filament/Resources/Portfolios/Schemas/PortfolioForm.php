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
                Section::make('General Data')
                    ->description('General portfolio information')
                    ->icon(Heroicon::DocumentText)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('image')
                                    ->label('Portfolio Image')
                                    ->image()
                                    ->disk('public')
                                    ->directory('images/portfolios')
                                    ->required(),
                                Grid::make(1)
                                    ->schema([
                                        TextInput::make('name')
                                            ->label('Portfolio Name')
                                            ->placeholder('e.g. Mobile Banking App')
                                            ->required(),
                                        Select::make('type')
                                            ->label('Category / Type')
                                            ->options(['mobile' => 'Mobile', 'desktop' => 'Desktop'])
                                            ->default('mobile')
                                            ->required(),
                                    ])
                            ])
                    ])->columnSpanFull(),
                Section::make('Portfolio Description')
                    ->description('Detailed description of the portfolio')
                    ->icon(Heroicon::DocumentText)
                    ->schema([
                        RichEditor::make('description')
                            ->label('Description')
                            ->helperText('Write detailed portfolio description here')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull()
            ]);
    }
}
