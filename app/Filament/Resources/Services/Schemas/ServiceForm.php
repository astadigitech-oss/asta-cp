<?php

namespace App\Filament\Resources\Services\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Media & Images')
                    ->description('Logo and supporting image settings')
                    ->icon(Heroicon::Photo)
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                FileUpload::make('logo')
                                    ->label('Service Logo')
                                    ->required()
                                    ->image()
                                    ->directory('images/service')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Service logo image'),
                                FileUpload::make('cover_image')
                                    ->label('Cover / Thumbnail Background')
                                    ->image()
                                    ->directory('images/service')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Background image shown on hover in desktop slider'),
                                FileUpload::make('image')
                                    ->label('Detail Images')
                                    ->required()
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->directory('images/service')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Images for service detail page (multiple allowed)'),
                            ])
                    ])->columnSpanFull(),

                Section::make('Main Data')
                    ->description('General service information')
                    ->icon(Heroicon::InformationCircle)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Service Name')
                                    ->helperText('Name of the service')
                                    ->required(),
                                Toggle::make('show_name')
                                    ->label('Show Name')
                                    ->helperText('Toggle to display service name')
                                    ->default(true)
                                    ->required(),
                            ]),
                        Textarea::make('header')
                            ->label('Service Header')
                            ->required()
                            ->helperText('Main service header text')
                            ->columnSpanFull(),
                    ])->columnSpanFull(),

                Section::make('Service Description')
                    ->description('Short summary and detailed service description')
                    ->icon(Heroicon::InformationCircle)
                    ->schema([
                        RichEditor::make('short_description')
                            ->label('Short Description')
                            ->extraInputAttributes(['style' => 'min-height: 150px;'])
                            ->toolbarButtons([
                                'blockquote', 'bold', 'bulletList', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->required()
                            ->helperText('Short description displayed in menu')
                            ->columnSpanFull(),
                        RichEditor::make('description')
                            ->label('Detailed Description')
                            ->extraInputAttributes(['style' => 'min-height: 200px;'])
                            ->toolbarButtons([
                                'attachFiles', 'blockquote', 'bold', 'bulletList', 'codeBlock', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->required()
                            ->helperText('Full detailed description of the service')
                            ->columnSpanFull(),
                    ])->columnSpanFull()
            ]);
    }
}
