<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::post('/petitions/firmar/{id}', [PetitionController::class, 'firmar']);
// --- RUTAS PÚBLICAS ---
// Estas rutas se pueden probar en Postman sin necesidad de Token
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// Ver todas las peticiones (incluye load de user, categoria, files según el PDF)
Route::get('petitions', [PetitionController::class, 'index']);
// Ver el detalle de una petición específica
Route::get('petitions/{id}', [PetitionController::class, 'show']);


// --- RUTAS PROTEGIDAS (Requieren Token JWT) ---
// El middleware 'auth:api' es el que usa JWT
Route::middleware('auth:api')->group(function () {

    // Gestión de Sesión
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    // Operaciones de Peticiones (CRUD Protegido)
    Route::get('mispetitions', [PetitionController::class, 'listmine']); // Listar mis creaciones
    Route::post('petitions', [PetitionController::class, 'store']);     // Crear nueva
    Route::put('petitions/{id}', [PetitionController::class, 'update']); // Editar (si soy dueño)
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']); // Borrar (si soy dueño)

    // En tu routes/api.php de Laravel
    Route::get('/categories', function () {
        return response()->json(App\Models\Category::all());
    });
    // Acciones Especiales mencionadas en tu PDF
    Route::put('petitions/firmar/{id}', [PetitionController::class, 'firmar']);
    Route::put('petitions/estado/{id}', [PetitionController::class, 'cambiarEstado']);
});
Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);
