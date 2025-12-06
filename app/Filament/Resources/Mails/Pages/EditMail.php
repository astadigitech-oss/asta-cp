<?php

namespace App\Filament\Resources\Mails\Pages;

use App\Filament\Resources\Mails\MailResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ForceDeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Resources\Pages\EditRecord;

class EditMail extends EditRecord
{
    protected static string $resource = MailResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('Sudah Dijawab')
            ->label('Sudah Dijawab')
            ->requiresConfirmation()
            ->color('success')
            ->successRedirectUrl(route('filament.dapur-belakang.resources.mails.index'))
            ->visible(function () {
                return $this->record->status === 'not_answered';
            })
            ->action(function () {
                $this->record->status = 'answered';
                $this->record->save();
            }),
            DeleteAction::make(),
            ForceDeleteAction::make(),
            RestoreAction::make(),
        ];
    }
}
