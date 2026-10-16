<?php

namespace App\Filament\Resources\Articles\Schemas;

use App\Models\Article;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Str;

class ArticleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Utama Artikel')
                    ->description('Judul, URL slug, penulis, dan gambar cover banner')
                    ->icon(Heroicon::DocumentText)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('title')
                                    ->label('Judul Artikel Blog')
                                    ->placeholder('Misal: Panduan Lengkap Optimasi Website 2026')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($set, ?string $state, ?string $operation) {
                                        if ($operation === 'create') {
                                            $clean = trim((string) $state);

                                            // Bersihkan format lokalisasi [:id]...[:en]...
                                            if (preg_match('/\[:\s*(id|en)\s*\]/i', $clean)) {
                                                $parts = preg_split('/\[:\s*(id|en)\s*\]/i', $clean, -1, PREG_SPLIT_DELIM_CAPTURE);
                                                $slugs = [];
                                                for ($i = 1; $i < count($parts); $i += 2) {
                                                    $tag = strtolower(trim($parts[$i]));
                                                    $val = preg_replace('/\[:\s*\]$/', '', trim($parts[$i + 1] ?? ''));
                                                    if (!empty($val)) {
                                                        $slugs[$tag] = \Illuminate\Support\Str::slug($val);
                                                    }
                                                }
                                                if (!empty($slugs)) {
                                                    $multiSlug = '';
                                                    foreach ($slugs as $t => $s) {
                                                        $multiSlug .= "[:{$t}]{$s}";
                                                    }
                                                    $set('slug', $multiSlug);
                                                    return;
                                                }
                                            } elseif (preg_match_all('/\[\s*(id|en)\s*\](.*?)\[\/\s*\1\s*\]/is', $clean, $matches, PREG_SET_ORDER)) {
                                                $multiSlug = '';
                                                foreach ($matches as $m) {
                                                    $tag = strtolower(trim($m[1]));
                                                    $s = \Illuminate\Support\Str::slug(trim($m[2]));
                                                    $multiSlug .= "[:{$tag}]{$s}";
                                                }
                                                if (!empty($multiSlug)) {
                                                    $set('slug', $multiSlug);
                                                    return;
                                                }
                                            }

                                            $set('slug', Str::slug($clean));
                                        }
                                    }),

                                TextInput::make('slug')
                                    ->label('URL Slug (Multilingual)')
                                    ->placeholder('[:id]judul-artikel[:en]article-title atau cukup judul-artikel')
                                    ->required()
                                    ->unique(Article::class, 'slug', ignoreRecord: true, modifyRuleUsing: fn ($rule) => $rule->whereNull('deleted_at'))
                                    ->helperText('Mendukung format multilingual [:id]slug-id[:en]slug-en. Akan diakses melalui domain.com/slug-anda'),
                            ]),

                        Grid::make(2)
                            ->schema([
                                TextInput::make('author')
                                    ->label('Penulis / Author')
                                    ->default('ASTA Digital Team')
                                    ->required(),

                                TextInput::make('category')
                                    ->label('Kategori')
                                    ->default('Technology')
                                    ->placeholder('Technology, Design, Business, dll'),
                            ]),

                        Grid::make(2)
                            ->schema([
                                FileUpload::make('thumbnail')
                                    ->label('Gambar Utama / Cover Thumbnail')
                                    ->image()
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
                                    ->directory('articles/covers')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->imageEditor()
                                    ->helperText('Cover utama kartu blog & share preview')
                                    ->nullable(),

                                FileUpload::make('images')
                                    ->label('Foto Galeri / Banner Tambahan (Carousel)')
                                    ->image()
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
                                    ->multiple()
                                    ->maxFiles(6)
                                    ->reorderable()
                                    ->directory('articles/gallery')
                                    ->disk('public')
                                    ->visibility('public')
                                    ->helperText('Upload beberapa gambar jika ingin menampilkan slider carousel di atas artikel'),
                            ]),

                        Textarea::make('excerpt')
                            ->label('Pengantar / Ringkasan Excerpt')
                            ->rows(3)
                            ->placeholder('Deskripsi pengantar singkat sebelum membaca materi/isi lengkap...')
                            ->helperText('Tampil sebagai lead text di awal artikel dan fallback meta description')
                            ->columnSpanFull(),

                        Grid::make(2)
                            ->schema([
                                Toggle::make('is_published')
                                    ->label('Publish Sekarang?')
                                    ->default(true)
                                    ->required(),

                                DateTimePicker::make('published_at')
                                    ->label('Waktu Publikasi')
                                    ->default(now())
                                    ->required(),
                            ]),
                    ])->columnSpanFull(),

                Section::make('Konten Dinamis & Modular (Gambar + Teks Berurutan)')
                    ->description('Susun alur artikel secara dinamis: tambah gambar/video dan narasi/teks penjelasan per-bagian secara berurutan.')
                    ->icon(Heroicon::Sparkles)
                    ->schema([
                        Repeater::make('content_sections')
                            ->label('Bagian Konten Modular (Image / Video + Description)')
                            ->schema([
                                Radio::make('media_type')
                                    ->label('Tipe Media')
                                    ->options([
                                        'image' => 'Upload Gambar',
                                        'video' => 'Link Video YouTube',
                                        'none' => 'Hanya Teks',
                                    ])
                                    ->default('image')
                                    ->inline()
                                    ->live()
                                    ->required(),

                                FileUpload::make('image')
                                    ->label('Upload Gambar Bagian Ini')
                                    ->image()
                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
                                    ->disk('public')
                                    ->directory('articles/sections')
                                    ->visibility('public')
                                    ->imageEditor()
                                    ->visible(fn ($get) => $get('media_type') === 'image')
                                    ->nullable(),

                                TextInput::make('video_url')
                                    ->label('Link Video YouTube')
                                    ->placeholder('https://www.youtube.com/watch?v=...')
                                    ->url()
                                    ->visible(fn ($get) => $get('media_type') === 'video')
                                    ->nullable(),

                                RichEditor::make('description')
                                    ->label('Isi / Narasi / Penjelasan Bagian Ini')
                                    ->placeholder('Tulis narasi atau materi untuk bagian ini...')
                                    ->toolbarButtons([
                                        'blockquote', 'bold', 'bulletList', 'codeBlock', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                                    ])
                                    ->extraInputAttributes(['style' => 'min-height: 180px;'])
                                    ->nullable(),
                            ])
                            ->itemLabel(function (array $state): ?string {
                                $desc = $state['description'] ?? null;
                                if (is_string($desc) && filled(strip_tags($desc))) {
                                    return Str::limit(strip_tags($desc), 50);
                                }
                                if (!empty($state['video_url'])) {
                                    return 'Video: ' . Str::limit($state['video_url'], 30);
                                }
                                if (!empty($state['image'])) {
                                    return 'Gambar Section';
                                }
                                return 'Bagian Konten Baru';
                            })
                            ->addActionLabel('+ Tambah Bagian Konten Baru (Gambar/Video & Teks)')
                            ->collapsible()
                            ->reorderable()
                            ->cloneable()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),

                Section::make('Editor Body Tambahan / Catatan Akhir (Opsional)')
                    ->description('Gunakan bagian ini jika ingin menambahkan teks HTML penutup di luar bagian modular')
                    ->icon(Heroicon::Document)
                    ->collapsed()
                    ->schema([
                        RichEditor::make('body')
                            ->label('Isi Body Lengkap')
                            ->extraInputAttributes(['style' => 'min-height: 250px;'])
                            ->toolbarButtons([
                                'attachFiles', 'blockquote', 'bold', 'bulletList', 'codeBlock', 'h2', 'h3', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->fileAttachmentsDirectory('articles/content')
                            ->fileAttachmentsDisk('public')
                            ->fileAttachmentsVisibility('public')
                            ->nullable()
                            ->columnSpanFull(),
                    ])->columnSpanFull(),

                Section::make('Search Engine Optimization & Social Meta')
                    ->description('Pengaturan metadata SEO untuk Google Search, OpenGraph, dan Twitter Card')
                    ->icon(Heroicon::MagnifyingGlass)
                    ->relationship('seoMeta')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('title')
                                    ->label('Meta Title')
                                    ->placeholder('Biarkan kosong untuk otomatis memakai judul artikel')
                                    ->maxLength(70)
                                    ->helperText('Maks. 70 karakter untuk hasil pencarian Google'),

                                TextInput::make('canonical')
                                    ->label('Canonical URL')
                                    ->url()
                                    ->placeholder('https://domain.com/slug-anda')
                                    ->helperText('URL kanonikal jika artikel ini memiliki sumber asli lain'),
                            ]),

                        Textarea::make('description')
                            ->label('Meta Description')
                            ->placeholder('Deskripsi ringkas artikel untuk cuplikan mesin pencari Google...')
                            ->rows(3)
                            ->maxLength(160)
                            ->helperText('Panjang ideal 120-160 karakter'),

                        Grid::make(2)
                            ->schema([
                                TagsInput::make('focus_keywords')
                                    ->label('Focus Keywords')
                                    ->placeholder('Ketik keyword lalu tekan Enter')
                                    ->helperText('Kata kunci target untuk optimasi artikel ini'),

                                Select::make('robots')
                                    ->label('Robots Indexing Tag')
                                    ->options([
                                        'index, follow' => 'Index, Follow (Direkomendasikan)',
                                        'noindex, follow' => 'No Index, Follow',
                                        'index, nofollow' => 'Index, No Follow',
                                        'noindex, nofollow' => 'No Index, No Follow',
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
