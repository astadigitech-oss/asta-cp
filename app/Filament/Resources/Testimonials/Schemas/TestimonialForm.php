<?php

namespace App\Filament\Resources\Testimonials\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class TestimonialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Foto / Avatar')
                    ->description('Upload foto profil pemberi testimoni (opsional)')
                    ->icon(Heroicon::Photo)
                    ->schema([
                        FileUpload::make('avatar')
                            ->image()
                            ->directory('images/testimonials')
                            ->disk('public')
                            ->visibility('public')
                            ->helperText('Foto profil atau logo (opsional)'),
                    ])->columnSpanFull(),

                Section::make('Informasi Klien')
                    ->description('Detail pemberi testimoni')
                    ->icon(Heroicon::User)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Klien')
                                    ->required()
                                    ->helperText('Misal: Surya Aditama'),
                                TextInput::make('role')
                                    ->label('Jabatan / Posisi')
                                    ->helperText('Misal: Head of IT'),
                                TextInput::make('org')
                                    ->label('Perusahaan / Instansi')
                                    ->helperText('Misal: Dinas Kominfo / PT Mitra Andalan'),
                                TextInput::make('tag')
                                    ->label('Tag / Kategori')
                                    ->helperText('Misal: Government, Enterprise, Education'),
                            ]),
                    ])->columnSpanFull(),

                Section::make('Isi Testimoni & Pengaturan')
                    ->description('Kutipan testimoni dan status publikasi')
                    ->icon(Heroicon::ChatBubbleBottomCenterText)
                    ->schema([
                        Textarea::make('quote')
                            ->label('Pesan / Testimoni')
                            ->required()
                            ->rows(4)
                            ->columnSpanFull(),
                        Grid::make(3)
                            ->schema([
                                TextInput::make('rating')
                                    ->label('Rating (1 - 5)')
                                    ->numeric()
                                    ->default(5)
                                    ->minValue(1)
                                    ->maxValue(5)
                                    ->required(),
                                TextInput::make('sort')
                                    ->label('Urutan (Sort)')
                                    ->numeric()
                                    ->default(0)
                                    ->required(),
                                Toggle::make('is_active')
                                    ->label('Tampilkan di Landing Page')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ])->columnSpanFull(),
            ]);
    }
}
