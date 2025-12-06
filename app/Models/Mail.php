<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mail extends Model
{
    use SoftDeletes, HasUuids;

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'message',
        'status',
    ];
}
