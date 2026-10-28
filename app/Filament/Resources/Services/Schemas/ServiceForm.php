<?php

namespace App\Filament\Resources\Services\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Str;

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
                        TextInput::make('header')
                            ->label('Service Tag / Label')
                            ->placeholder('Contoh: Produk, Layanan, Solusi')
                            ->helperText('Tag/kategori layanan yang tampil sebagai badge di dialog (misal: Produk atau Layanan)')
                            ->required()
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
                    ])->columnSpanFull(),

                Section::make('Kesiapan GEO & AI (FAQ Layanan)')
                    ->description('Pertanyaan dan jawaban terstruktur seputar layanan ini yang otomatis diekstraksi mesin pencari dan bot AI')
                    ->icon(Heroicon::Sparkles)
                    ->schema([
                        Repeater::make('faqs')
                            ->label('Daftar FAQ Layanan (3-5 Pertanyaan Spesifik)')
                            ->schema([
                                TextInput::make('question')
                                    ->label('Pertanyaan Pengguna')
                                    ->placeholder('Misal: Apa teknologi utama yang digunakan untuk layanan ini?')
                                    ->required(),
                                Textarea::make('answer')
                                    ->label('Jawaban Definitif & Padat')
                                    ->placeholder('Tulis jawaban lugas dengan menyebut entitas ASTA DIGITAL AGENCY...')
                                    ->rows(3)
                                    ->required(),
                            ])
                            ->itemLabel(fn (array $state): ?string => !empty($state['question']) ? Str::limit($state['question'], 50) : 'FAQ Layanan')
                            ->addActionLabel('+ Tambah Pertanyaan Layanan')
                            ->collapsible()
                            ->reorderable()
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->columnSpanFull(),

                Section::make('Search Engine Optimization (SEO) & Social Meta')
                    ->description('Pengaturan metadata Rankbeam SEO untuk Google Search, OpenGraph, dan Twitter Card')
                    ->icon(Heroicon::MagnifyingGlass)
                    ->relationship('seoMeta')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('title')
                                    ->label('SEO Meta Title')
                                    ->placeholder('Biarkan kosong untuk otomatis memakai nama layanan')
                                    ->maxLength(70)
                                    ->helperText('Maks. 70 karakter untuk hasil pencarian Google'),

                                TextInput::make('canonical')
                                    ->label('Canonical URL')
                                    ->url()
                                    ->placeholder('https://domain.com/layanan/...')
                                    ->helperText('URL kanonikal jika layanan ini memiliki sumber asli lain'),
                            ]),

                        Textarea::make('description')
                            ->label('SEO Meta Description')
                            ->placeholder('Deskripsi ringkas layanan untuk cuplikan mesin pencari Google...')
                            ->rows(3)
                            ->maxLength(160)
                            ->helperText('Panjang ideal 120-160 karakter')
                            ->columnSpanFull(),

                        Grid::make(2)
                            ->schema([
                                TagsInput::make('focus_keywords')
                                    ->label('Focus Keywords')
                                    ->placeholder('Ketik keyword lalu tekan Enter')
                                    ->helperText('Kata kunci target untuk optimasi SEO layanan ini'),

                                Select::make('robots')
                                    ->label('Robots Indexing Tag')
                                    ->options([
                                        'index, follow'        => 'Index, Follow (Direkomendasikan)',
                                        'noindex, follow'      => 'No Index, Follow',
                                        'index, nofollow'      => 'Index, No Follow',
                                        'noindex, nofollow'    => 'No Index, No Follow',
                                    ])
                                    ->default('index, follow')
                                    ->native(false),
                            ]),

                        Grid::make(2)
                            ->schema([
                                TextInput::make('og_title')
                                    ->label('Custom OpenGraph Title')
                                    ->maxLength(70)
                                    ->placeholder('Judul khusus share ke WhatsApp/Medsos'),

                                TextInput::make('twitter_title')
                                    ->label('Custom Twitter/X Title')
                                    ->maxLength(70)
                                    ->placeholder('Judul khusus share ke X/Twitter'),
                            ]),

                        FileUpload::make('og_image')
                            ->label('Custom Social Share Image (OG / Twitter)')
                            ->image()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
                            ->directory('seo/og')
                            ->disk('public')
                            ->visibility('public')
                            ->helperText('Gambar khusus untuk preview share di WhatsApp, Facebook, LinkedIn, Twitter (1200x630 px)')
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->columnSpanFull(),
            ]);
    }
}
