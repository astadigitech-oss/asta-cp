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
        'year',
        'logo',
        'image',
        'show_name',
        'sort',
        'is_pinned',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
        ];
    }

    public function DiscoverLists()
    {
        return $this->hasMany(DiscoverList::class);
    }
}
