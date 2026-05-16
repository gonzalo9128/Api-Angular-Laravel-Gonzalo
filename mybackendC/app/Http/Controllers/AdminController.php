<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        $petitions = \App\Models\Petition::with(['user', 'category', 'files'])->get();
        return response()->json(['success' => true, 'data' => $petitions, 'message' => 'Todas las peticiones']);
    }

    public function destroy($id)
    {
        $petition = \App\Models\Petition::findOrFail($id);
        foreach ($petition->files as $file) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($file->file_path);
        }
        // IMPORTANTE: Desvincular las firmas antes de borrar para evitar error de Foreign Key
        $petition->firmas()->detach();
        $petition->delete();
        return response()->json(['success' => true, 'message' => 'Petición borrada por admin']);
    }

    public function update(Request $request, $id)
    {
        $petition = \App\Models\Petition::findOrFail($id);
        $petition->update($request->all());
        return response()->json(['success' => true, 'data' => $petition, 'message' => 'Petición actualizada por admin']);
    }

    // --- USUARIOS ---
    public function getUsers()
    {
        $users = \App\Models\User::all();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function deleteUser($id)
    {
        $user = \App\Models\User::findOrFail($id);
        if ($user->role_id === 1) {
            return response()->json(['message' => 'No puedes borrar a otro administrador'], 403);
        }

        // 1. Desvincular todas sus firmas de otras peticiones
        $user->firmas()->detach();

        // 2. Borrar las peticiones que haya creado (con sus archivos y firmas)
        $petitions = \App\Models\Petition::where('user_id', $user->id)->get();
        foreach ($petitions as $petition) {
            foreach ($petition->files as $file) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($file->file_path);
            }
            $petition->firmas()->detach();
            $petition->delete();
        }

        $user->delete();
        return response()->json(['success' => true, 'message' => 'Usuario borrado']);
    }

    // --- CATEGORIAS ---
    public function getCategories()
    {
        $categories = \App\Models\Category::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function deleteCategory($id)
    {
        $category = \App\Models\Category::findOrFail($id);

        // Borrar todas las peticiones asociadas a esta categoría
        $petitions = \App\Models\Petition::where('category_id', $category->id)->get();
        foreach ($petitions as $petition) {
            foreach ($petition->files as $file) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($file->file_path);
            }
            $petition->firmas()->detach();
            $petition->delete();
        }

        $category->delete();
        return response()->json(['success' => true, 'message' => 'Categoría borrada']);
    }

    public function createCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = \App\Models\Category::create(['name' => $request->name]);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = \App\Models\Category::findOrFail($id);
        $category->update(['name' => $request->name]);
        return response()->json(['success' => true, 'data' => $category]);
    }
}
