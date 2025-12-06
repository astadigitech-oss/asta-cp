<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceListMain extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'service_id',
        'description',
        'sort'
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
