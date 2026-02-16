<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    // Campos permitidos para asignación masiva (Corrige el error 500 de tu imagen)
    protected $fillable = [
        'name',
        'file_path',
        'petition_id', // Si en tu tabla usaste 'peticione_id', cámbialo aquí
    ];

    // Relación: Un archivo pertenece a una petición
    public function petition()
    {
        return $this->belongsTo(Petition::class);
    }
}
