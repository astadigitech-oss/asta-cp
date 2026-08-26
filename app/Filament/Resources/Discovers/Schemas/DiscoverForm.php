<?php

namespace App\Filament\Resources\Discovers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
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
                                    ->label('Background / Timeline Images')
                                    ->image()
                                    ->multiple()
                                    ->maxFiles(4)
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('images/discovers')
                                    ->visibility('public')
                                    ->helperText('Upload up to 4 images (optional)'),
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
                                            ->label('Pin to Top')
                                            ->helperText('Pinned discoveries will appear at the top on the landing page and navbar.')
                                            ->default(false),
                                        Toggle::make('is_highlight')
                                            ->label('Highlight to Timeline (About)')
                                            ->helperText('Enable this to show this item on the Company Story & Timeline section in About (maximum 4 items).')
                                            ->default(false),
                                    ])->columnSpanFull(),
                            ])
                    ])->columnSpanFull(),
                Section::make('Admin Description')
                    ->icon(Heroicon::OutlinedDocumentText)
                    ->description('Internal description notes for admin')
                    ->schema([
                        RichEditor::make('short_description')
                            ->label('Short Description')
                            ->extraInputAttributes(['style' => 'min-height: 180px;'])
                            ->toolbarButtons([
                                'blockquote', 'bold', 'bulletList', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->helperText('Internal admin description only, will not appear on the main landing page')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),
            ]);
    }
}
