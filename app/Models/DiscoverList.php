<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscoverList extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'discover_id',
        'description',
        'sort',
        'is_active',
    ];

    public function discover()
    {
        return $this->belongsTo(Discover::class);
    }

    protected static function booted()
    {
        static::saving(function ($model) {
            if ($model->is_active) {
                // Cari data aktif untuk discover_id yang sama, kecuali dirinya sendiri
                $activeQuery = self::where('discover_id', $model->discover_id)
                    ->where('is_active', 1)
                    ->when($model->exists, fn($q) => $q->where('id', '!=', $model->id))
                    ->orderBy('updated_at', 'asc'); // paling lama duluan

                $activeCount = $activeQuery->count();

                // Kalau sudah ada 4 aktif, matikan yang paling lama
                if ($activeCount >= 4) {
                    $oldestActive = $activeQuery->first();
                    if ($oldestActive) {
                        $oldestActive->update(['is_active' => 0]);
                    }
                }
            }
        });
    }
}
