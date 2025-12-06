<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class PortfolioTab extends Component
{
    public $src, $title;
    /**
     * Create a new component instance.
     */
    public function __construct($src = null, $title = null)
    {
        $this->src = $src;
        $this->title = $title;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.portfolio-tab');
    }
}
