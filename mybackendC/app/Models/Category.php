<?php

namespace App\Models;

use app\Models\Petition;
use Illuminate\Database\Eloquent\Model;
use function Symfony\Component\String\u;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'catgeory_id';
    protected $fillable = ['name'];

    public function petitions(){
        return $this->hasMany(Petition::class, 'category_id');
    }
}
