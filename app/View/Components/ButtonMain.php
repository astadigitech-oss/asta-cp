<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class ButtonMain extends Component
{
    public $href, $label, $style;
    public function __construct($href = null, $label = null, $style = null)
    {
        $this->href = $href;
        $this->label = $label;
        $this->style = $style;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.button-main');
    }
}
