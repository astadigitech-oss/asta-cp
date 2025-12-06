<?php

namespace App\View\Components;

use App\Models\Discover;
use App\Models\Service;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Burger extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $services = Service::orderBy('sort', 'asc')->get();
        $discovers = Discover::with(['DiscoverLists' => function ($query) {
            $query->where('is_active', true)
                ->orderBy('sort', 'asc');
        }])
            ->orderBy('sort', 'asc')
            ->get();

        return view(
            'components.burger',
            [
                'services' => $services,
                'discovers' => $discovers
            ]
        );
    }
}
