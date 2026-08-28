<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discover extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'year',
        'logo',
        'image',
        'show_name',
        'short_description',
        'content_sections',
        'sort',
        'is_pinned',
        'is_highlight',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_highlight' => 'boolean',
            'image' => 'array',
            'content_sections' => 'array',
        ];
    }

    public function DiscoverLists()
    {
        return $this->hasMany(DiscoverList::class);
    }
}
