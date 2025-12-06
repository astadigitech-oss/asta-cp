<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class MenuDropdown extends Component
{
    public $label, $textSeeMore, $style, $hidden, $hiddenSecondary, $href;
    /**
     * Create a new component instance.
     */
    public function __construct(
        $label = null,
        $textSeeMore = null,
        $style = null,
        $hidden = null,
        $hiddenSecondary = null,
        $href = null
    )
    {
        $this->label = $label;
        $this->textSeeMore = $textSeeMore;
        $this->style = $style;
        $this->hidden = $hidden;
        $this->hiddenSecondary = $hiddenSecondary;
        $this->href = $href;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.menu-dropdown');
    }
}
