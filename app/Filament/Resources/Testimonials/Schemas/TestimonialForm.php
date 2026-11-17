<?php

namespace App\Filament\Resources\Testimonials\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
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
                Section::make('Photo / Avatar')
                    ->description('Upload testimonial provider profile photo (optional)')
                    ->icon(Heroicon::Photo)
                    ->schema([
                        FileUpload::make('avatar')
                            ->label('Avatar')
                            ->image()
                            ->imageResizeMode('cover')
                            ->imageResizeTargetWidth('600')
                            ->imageResizeTargetHeight('600')
                            ->directory('images/testimonials')
                            ->disk('public')
                            ->visibility('public')
                            ->helperText('Profile photo or logo (optional)'),
                    ])->columnSpanFull(),

                Section::make('Client Information')
                    ->description('Details of testimonial provider')
                    ->icon(Heroicon::User)
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Client Name')
                                    ->required()
                                    ->helperText('e.g. Surya Aditama'),
                                TextInput::make('role')
                                    ->label('Position / Role')
                                    ->helperText('e.g. Head of IT'),
                                TextInput::make('org')
                                    ->label('Company / Organization')
                                    ->helperText('e.g. Ministry of ICT / Acme Inc.'),
                                TextInput::make('tag')
                                    ->label('Tag / Category')
                                    ->helperText('e.g. Government, Enterprise, Education'),
                            ]),
                    ])->columnSpanFull(),

                Section::make('Testimonial Content & Settings')
                    ->description('Testimonial quote and publication status')
                    ->icon(Heroicon::ChatBubbleBottomCenterText)
                    ->schema([
                        RichEditor::make('quote')
                            ->label('Testimonial Quote')
                            ->extraInputAttributes(['style' => 'min-height: 180px;'])
                            ->toolbarButtons([
                                'blockquote', 'bold', 'bulletList', 'italic', 'link', 'orderedList', 'redo', 'strike', 'underline', 'undo',
                            ])
                            ->required()
                            ->columnSpanFull(),
                        TextInput::make('source_url')
                            ->label('Public review/source URL (optional)')
                            ->url()
                            ->helperText('Optional. Add a link if the review is publicly available; a URL is not required to display the testimonial.')
                            ->columnSpanFull(),
                        Grid::make(4)
                            ->schema([
                                TextInput::make('rating')
                                    ->label('Rating (1 - 5)')
                                    ->numeric()
                                    ->default(5)
                                    ->minValue(1)
                                    ->maxValue(5)
                                    ->required(),
                                TextInput::make('sort')
                                    ->label('Sort Order')
                                    ->numeric()
                                    ->default(0)
                                    ->required(),
                                Toggle::make('is_active')
                                    ->label('Display on Landing Page')
                                    ->default(true)
                                    ->required(),
                                Toggle::make('is_verified')
                                    ->label('Customer permission confirmed')
                                    ->helperText('Record whether the customer approved publishing this testimonial. Display is controlled by "Display on Landing Page".')
                                    ->default(false)
                                    ->required(),
                            ]),
                    ])->columnSpanFull(),
            ]);
    }
}
