<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Logo extends Component
{
    public $size, $logo;
    /**
     * Create a new component instance.
     */
    public function __construct($size = null, $logo = null)
    {
        $this->size = $size;
        $this->logo = $logo;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.logo');
    }
}
