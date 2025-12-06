<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class SkillImg extends Component
{
    public $src, $style;
    /**
     * Create a new component instance.
     */
    public function __construct($src = null, $style = null)
    {
        $this->src = $src;
        $this->style = $style;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.skill-img');
    }
}
