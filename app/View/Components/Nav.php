<?php

namespace App\View\Components;

use App\Models\Discover;
use App\Models\Portfolio;
use App\Models\Service;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Nav extends Component
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
        $services = Service::orderBy('sort', 'asc')->take(5)->get();
        $mobiles = Portfolio::where('type', 'mobile')->orderBy('sort', 'asc')->take(3)->get();
        $desktops = Portfolio::where('type', 'desktop')->orderBy('sort', 'asc')->take(3)->get();
        $discovers = Discover::with(['DiscoverLists' => function ($q) {
            $q->where('is_active', 1)->orderBy('sort', 'asc');
        }])
            ->orderBy('sort', 'asc')
            ->get();

        // dd($services);
        return view('components.nav', [
            'services' => $services,
            'mobiles' => $mobiles,
            'desktops' => $desktops,
            'discovers' => $discovers
        ]);
    }
}
