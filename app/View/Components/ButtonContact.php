<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class ButtonContact extends Component
{
    public $svg, $label, $bg, $href;
    /**
     * Create a new component instance.
     */
    public function __construct($svg = null, $label = null, $bg = null, $href = null)
    {
        $this->href = $href;
        $this->svg = $svg;
        $this->label = $label;
        $this->bg = $bg;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.button-contact');
    }
}
