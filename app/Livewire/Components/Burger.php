<?php

namespace App\Livewire\Components;

use Livewire\Component;

class Burger extends Component
{
    public bool $burgerActive = false;
    public bool $product = false;
    public bool $portfolio = false;
    public bool $discover = false;

    public function toggle()
    {
        $this->burgerActive = ! $this->burgerActive;
    }
    public function productToggle()
    {
        $this->product = ! $this->product;
    }
    public function portfolioToggle()
    {
        $this->portfolio = ! $this->portfolio;
    }
    public function discoverToggle()
    {
        $this->discover = ! $this->discover;
    }
    public function render()
    {
        return view('livewire.components.burger');
    }
}
