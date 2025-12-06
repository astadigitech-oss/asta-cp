<?php

namespace App\View\Components;

use App\Models\Client;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Trusted extends Component
{
    public $swiperName;
    /**
     * Create a new component instance.
     */
    public function __construct($swiperName = null)
    {
        $this->swiperName = $swiperName;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $clients = Client::all();
        return view('components.trusted', [
            'clients' => $clients
        ]);
    }
}
