<?php

namespace App\Livewire\Src\Home;

use App\Models\Service;
use Livewire\Component;

class Index extends Component
{
    // public $dataServices;
    public function render()
    {
        $dataServices = Service::orderBy('sort', 'asc')->get();
        return view('livewire.src.home.index', [
            'services' => $dataServices
        ]);
    }
}
