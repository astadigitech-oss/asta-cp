<?php

namespace App\Livewire\Components;

use Livewire\Component;

class ButtonTab extends Component
{
    public bool $tabActive = false;
    public $label;

    public function tabToggle()
    {
        $this->tabActive = ! $this->tabActive;
    }
    public function render()
    {
        return view('livewire.components.button-tab');
    }
}
