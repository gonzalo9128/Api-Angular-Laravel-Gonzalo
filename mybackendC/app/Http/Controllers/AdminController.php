<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category;
use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Exception;

class AdminController extends Controller
{
    private function sendResponse($data, $message, $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $code);
    }

    private function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'success' => false,
            'message' => $error,
        ];
        if (!empty($errorMessages)) {
            $response['errors'] = $errorMessages;
        }
        return response()->json($response, $code);
    }

    // ==========================================
    // USUARIOS
    // ==========================================

    public function getUsers()
    {
        try {
            $users = User::all();
            return $this->sendResponse($users, 'Usuarios recuperados con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar usuarios', $e->getMessage(), 500);
        }
    }

    public function changeUserRole(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,user',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Error de validación', $validator->errors(), 422);
        }

        try {
            $user = User::findOrFail($id);
            
            // Evitar que el admin se cambie el rol a sí mismo
            if ($user->id === Auth::id()) {
                return $this->sendError('No puedes cambiar tu propio rol', [], 403);
            }

            $user->role = $request->role;
            $user->save();

            return $this->sendResponse($user, 'Rol de usuario actualizado con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al cambiar rol', $e->getMessage(), 500);
        }
    }

    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            // Evitar que el admin se borre a sí mismo
            if ($user->id === Auth::id()) {
                return $this->sendError('No puedes eliminar tu propia cuenta de administrador', [], 403);
            }

            $user->delete();
            return $this->sendResponse(null, 'Usuario eliminado con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al eliminar usuario', $e->getMessage(), 500);
        }
    }

    // ==========================================
    // CATEGORÍAS
    // ==========================================

    public function getCategories()
    {
        try {
            $categories = Category::all();
            return $this->sendResponse($categories, 'Categorías recuperadas con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar categorías', $e->getMessage(), 500);
        }
    }

    public function storeCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:categories,name|max:255',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Error de validación', $validator->errors(), 422);
        }

        try {
            $category = Category::create($request->all());
            return $this->sendResponse($category, 'Categoría creada con éxito', 201);
        } catch (Exception $e) {
            return $this->sendError('Error al crear categoría', $e->getMessage(), 500);
        }
    }

    public function updateCategory(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255|unique:categories,name,' . $id,
        ]);

        if ($validator->fails()) {
            return $this->sendError('Error de validación', $validator->errors(), 422);
        }

        try {
            $category = Category::findOrFail($id);
            $category->update($request->all());
            return $this->sendResponse($category, 'Categoría actualizada con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al actualizar categoría', $e->getMessage(), 500);
        }
    }

    public function deleteCategory($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->delete();
            return $this->sendResponse(null, 'Categoría eliminada con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al eliminar categoría', $e->getMessage(), 500);
        }
    }

    // ==========================================
    // PETICIONES
    // ==========================================

    public function getPetitions()
    {
        try {
            $petitions = Petition::with(['user', 'category', 'files', 'firmas'])->get();
            return $this->sendResponse($petitions, 'Peticiones de administración recuperadas con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar peticiones', $e->getMessage(), 500);
        }
    }
}
