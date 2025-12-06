<?php

namespace App\Livewire\Src\ProductService;

use App\Models\Service;
use Livewire\Component;

class Detail extends Component
{
    public $id;

    public function render()
    {
        return view('livewire.src.product-service.detail',[
            'service' => Service::find($this->id)
        ]);
    }
}
