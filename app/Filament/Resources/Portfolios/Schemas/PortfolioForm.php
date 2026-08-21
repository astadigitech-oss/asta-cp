<?php

namespace App\Filament\Resources\Portfolios\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
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
                            ->placeholder('Write detailed portfolio description here...')
                            ->extraInputAttributes(['style' => 'min-height: 200px;'])
                            ->toolbarButtons([
                                'attachFiles',
                                'blockquote',
                                'bold',
                                'bulletList',
                                'codeBlock',
                                'h2',
                                'h3',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'underline',
                                'undo',
                            ])
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull()
            ]);
    }
}
