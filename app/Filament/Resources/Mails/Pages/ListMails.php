<?php

namespace App\Filament\Resources\Mails\Pages;

use App\Filament\Resources\Mails\MailResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;

class ListMails extends ListRecords
{
    protected static string $resource = MailResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function getTabs(): array
    {
        return [
            'Belum Dijawab' => Tab::make()
                ->icon(Heroicon::CheckCircle)
                ->modifyQueryUsing(fn(Builder $query) => $query->where('status', 'not_answered')),
            'Dijawab' => Tab::make()
                ->icon(Heroicon::XCircle)
                ->modifyQueryUsing(fn(Builder $query) => $query->where('status', 'answered')),
        ];
    }
}
