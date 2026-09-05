<?php

namespace App\Filament\Resources\Discovers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Str;

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
                                    ->label('Logo / Thumbnail Icon')
                                    ->required()
                                    ->disk('public')
                                    ->directory('images/logos'),
                                FileUpload::make('image')
                                    ->label('Cover / Timeline Images')
                                    ->image()
                                    ->multiple()
                                    ->maxFiles(4)
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('images/discovers')
                                    ->visibility('public')
                                    ->helperText('Upload up to 4 images for banner / carousel (optional)'),
                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('name')
                                            ->label('Title / Name')
                                            ->placeholder('e.g. Belajar UI/UX Dasar atau Perjalanan Astadigi')
                                            ->required(),
                                        Select::make('type')
                                            ->label('Tipe / Kategori')
                                            ->options([
                                                'story' => 'Discover Story & Berita',
                                                'elearning' => 'E-Learning & Blog',
                                            ])
                                            ->default('story')
                                            ->required()
                                            ->live(),
                                        TextInput::make('year')
                                            ->label('Timeline / Tanggal / Label')
                                            ->placeholder('e.g. 2026/01 atau E-LEARNING'),
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

                Section::make('Ringkasan / Pengantar')
                    ->icon(Heroicon::OutlinedDocumentText)
                    ->description('Deskripsi singkat pengantar konten')
                    ->schema([
                        RichEditor::make('short_description')
                            ->label('Deskripsi / Pengantar')
                            ->extraInputAttributes(['style' => 'min-height: 180px;'])
                            ->toolbarButtons([
                                'blockquote', 'bold', 'bulletList', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->helperText('Pengantar singkat sebelum membaca materi/cerita lengkap')
                            ->required()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),

                Section::make('Konten E-Learning / Blog (Modular Sections)')
                    ->icon(Heroicon::OutlinedAcademicCap)
                    ->description('Susun alur materi/artikel: upload gambar lalu tulis deskripsi secara berurutan tanpa limit.')
                    ->visible(fn ($get) => $get('type') === 'elearning')
                    ->schema([
                        Repeater::make('content_sections')
                            ->label('Bagian Konten (Image & Description)')
                            ->schema([
                                Radio::make('media_type')
                                    ->label('Tipe Media')
                                    ->options([
                                        'image' => 'Upload Gambar',
                                        'video' => 'Link Video',
                                    ])
                                    ->default('image')
                                    ->inline()
                                    ->live()
                                    ->required(),
                                FileUpload::make('image')
                                    ->label('Upload Gambar Section')
                                    ->image()
                                    ->disk('public')
                                    ->directory('images/elearning')
                                    ->visibility('public')
                                    ->visible(fn ($get) => $get('media_type') === 'image')
                                    ->nullable(),
                                TextInput::make('video_url')
                                    ->label('Link Video Section')
                                    ->placeholder('e.g. https://www.youtube.com/watch?v=example')
                                    ->url()
                                    ->helperText('Contoh: https://www.youtube.com/watch?v=example')
                                    ->visible(fn ($get) => $get('media_type') === 'video')
                                    ->nullable(),
                                RichEditor::make('description')
                                    ->label('Deskripsi / Penjelasan Section')
                                    ->placeholder('Tuliskan materi atau narasi untuk bagian ini...')
                                    ->toolbarButtons([
                                        'blockquote', 'bold', 'bulletList', 'codeBlock', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                                    ])
                                    ->extraInputAttributes(['style' => 'min-height: 150px;'])
                                    ->nullable(),
                            ])
                            ->itemLabel(function (array $state): ?string {
                                $desc = $state['description'] ?? null;
                                if (is_string($desc) && filled(strip_tags($desc))) {
                                    return Str::limit(strip_tags($desc), 50);
                                }
                                if (is_string($desc) && empty(strip_tags($desc)) && !empty($state['video_url'])) {
                                    return 'Video YouTube: ' . Str::limit($state['video_url'] ?? 'Belum ada link', 30);
                                }
                                if (!empty($state['image'])) {
                                    return 'Gambar Section';
                                }
                                return 'Section Baru';
                            })
                            ->addActionLabel('+ Tambah Bagian Baru (Gambar & Deskripsi)')
                            ->collapsible()
                            ->reorderable()
                            ->cloneable()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),
            ]);
    }
}
