<?php

namespace App\Livewire\Src\Portfolio;

use App\Models\Portfolio;
use Livewire\Component;

class Index extends Component
{
    public $activeCategory = 'mobile'; // default

    public function setCategory($category)
    {
        $this->activeCategory = $category;
    }
    public function render()
    {
        $mobiles = Portfolio::where('type', 'mobile')->orderBy('sort', 'asc')->get();
        $desktops = Portfolio::where('type', 'desktop')->orderBy('sort', 'asc')->get();

        // dd($mobiles, $desktops);
        return view('livewire.src.portfolio.index', [
            'mobiles' => $mobiles,
            'desktops' => $desktops
        ]);
    }
}
