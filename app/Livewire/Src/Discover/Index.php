<?php

namespace App\Livewire\Src\Discover;

use App\Models\Discover;
use App\Models\Service;
use App\Models\Mail;
use Livewire\Component;

class Index extends Component
{
    public $first_name, $last_name, $phone, $email, $message;

    public function save()
    {
        $this->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:20',
            'email'      => 'required|email|max:255',
            'message'    => 'nullable|string',
        ]);

        Mail::create([
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'phone'      => $this->phone,
            'email'      => $this->email,
            'message'    => $this->message,
        ]);

        // reset input
        $this->reset(['first_name', 'last_name', 'phone', 'email', 'message']);

        session()->flash('success', 'Pesan berhasil dikirim!');
    }

    public function render()
    {
        $services = Discover::with([
            'DiscoverLists' => function ($query) {
                $query->where('is_active', true)->orderBy('sort', 'asc');
            }
        ])->orderBy('sort', 'asc')->get();
        return view('livewire.src.discover.index', [
            'services' => $services
        ]);
    }
}
