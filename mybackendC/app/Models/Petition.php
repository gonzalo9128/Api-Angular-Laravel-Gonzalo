<?php

namespace App\Models;

use App\Models\File;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// OJO: Importamos el File correcto

class Petition extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'destinatary',
        'category_id',
    ];

    // --- AQUÍ ESTABA EL ERROR ---
    public function files()
    {
        // Antes tenías algo como: return $this->hasMany(\change_Monolitic...\File::class);
        // Ahora debe ser así:
        return $this->hasMany(File::class);
    }

    // Si tienes relación con usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Si tienes relación con categoría
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function firmantes()
    {
        return $this->belongsToMany(User::class, 'petition_user');
    }
    // Dentro de app/Models/Petition.php

    public function firmas()
    {
        // Esto indica que una petición tiene muchos usuarios que la firman
        // a través de la tabla pivote (probablemente 'petition_user')
        return $this->belongsToMany(User::class);
    }
}
