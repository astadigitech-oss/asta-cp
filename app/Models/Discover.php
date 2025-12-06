<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discover extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'short_description',
        'name',
        'logo',
        'show_name',
        'sort',
    ];

    public function DiscoverLists()
    {
        return $this->hasMany(DiscoverList::class);
    }
}
