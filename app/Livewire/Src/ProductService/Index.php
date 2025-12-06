<?php

namespace App\Livewire\Src\ProductService;

use App\Models\Client;
use App\Models\Service;
use Livewire\Component;

class Index extends Component
{
    public function render()
    {
        $dataServices = Service::orderBy('sort', 'asc')->get();
        return view('livewire.src.product-service.index', [
            'dataServices' => $dataServices,
        ]);
    }
}
