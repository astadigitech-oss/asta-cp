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
                Section::make('Image')
                    ->description('Information about the image')
                    ->icon(Heroicon::Photo)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('logo')
                                    ->required()
                                    ->image()
                                    ->directory('images/service')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Buat logo service nya'),
                                FileUpload::make('image')
                                    ->required()
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->directory('images/service')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Buat gambar di detail service nya (bisa lebih dari satu)'),
                            ])
                    ])->columnSpanFull(),

                Section::make('Main Data')
                    ->description('Information about the service')
                    ->icon(Heroicon::InformationCircle)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->helperText('Buat nama service nya')
                                    ->required(),
                                Toggle::make('show_name')
                                    ->helperText('Buat menyembunyikan nama service')
                                    ->default(true)
                                    ->required(),
                            ]),
                        Textarea::make('header')
                            ->required()
                            ->helperText('Buat service header nya, yang bold')
                            ->columnSpanFull(),
                    ])->columnSpanFull(),

                Section::make('Description')
                    ->description('Information description about the service')
                    ->icon(Heroicon::InformationCircle)
                    ->schema([
                        Textarea::make('short_description')
                            ->required()
                            ->helperText('Buat deskripsi singkat service nya yang ada di menu')
                            ->columnSpanFull(),
                        RichEditor::make('description')
                            ->required()
                            ->helperText('Buat deskripsi detail service nya')
                            ->columnSpanFull(),
                    ])->columnSpanFull()
            ]);
    }
}
