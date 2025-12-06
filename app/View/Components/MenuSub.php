<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class MenuSub extends Component
{
    public $href, $src, $font, $size, $title, $hidden, $maxW, $hiddenTitle;
    public function __construct(
        $href = null,
        $src = null,
        $font = null,
        $size = null,
        $title = null,
        $hidden = null,
        $maxW = null,
        $hiddenTitle = null
    )
    {
        $this->href = $href;
        $this->src = $src;
        $this->font = $font;
        $this->size = $size;
        $this->title = $title;
        $this->hidden = $hidden;
        $this->maxW = $maxW;
        $this->hiddenTitle = $hiddenTitle;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.menu-sub');
    }
}
