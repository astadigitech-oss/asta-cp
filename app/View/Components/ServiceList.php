<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class ServiceList extends Component
{
    public $bg, $text, $title, $svg;
    /**
     * Create a new component instance.
     */
    public function __construct($bg = null, $text = null, $title = null, $svg = null)
    {
        $this->bg = $bg;
        $this->text = $text;
        $this->title = $title;
        $this->svg = $svg;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.service-list');
    }
}
