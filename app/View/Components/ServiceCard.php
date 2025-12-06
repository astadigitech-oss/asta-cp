<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class ServiceCard extends Component
{
    public $src, $title, $link, $hidden, $style, $label;
    public bool $secondBg;
    /**
     * Create a new component instance.
     */
    public function __construct($label= "Pelajari Sekarang", $src = null, $title = null, $link = null, $hidden = null, $style = null, $secondBg = false)
    {
        $this->src = $src;
        $this->title = $title;
        $this->link = $link;
        $this->hidden = $hidden;
        $this->style = $style;
        $this->secondBg = $secondBg;
        $this->label = $label;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.service-card');
    }
}
