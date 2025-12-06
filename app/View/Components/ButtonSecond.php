<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class ButtonSecond extends Component
{
    public $href, $label;
    public bool $hoverBg;
    /**
     * Create a new component instance.
     */
    public function __construct($href = null, $label = null, $hoverBg = false)
    {
        $this->href = $href;
        $this->label = $label;
        $this->hoverBg = $hoverBg;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.button-second');
    }
}
