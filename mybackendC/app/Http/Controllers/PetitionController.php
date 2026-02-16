<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\File;
use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception;

class PetitionController extends Controller
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

    public function index()
    {
        try {
            // Adaptado: 'categoria' -> 'category'
            $petitions = Petition::with(['user', 'category', 'files'])->get();
            return $this->sendResponse($petitions, 'Peticiones recuperadas con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar peticiones', $e->getMessage(), 500);
        }
    }

    public function listMine()
    {
        try {
            $user = Auth::user();
            $petitions = Petition::where('user_id', $user->id)
                ->with(['user', 'category', 'files'])->get();
            return $this->sendResponse($petitions, 'Tus peticiones recuperadas con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al recuperar tus peticiones', $e->getMessage(), 500);
        }
    }

    public function show($id)
    {
        try {
            $petition = Petition::with(['user', 'category', 'files'])->findOrFail($id);
            return $this->sendResponse($petition, 'Petición encontrada');
        } catch (Exception $e) {
            return $this->sendError('Petición no encontrada', [], 404); // [cite: 214]
        }
    }

    public function store(Request $request)
    {
        // Validación adaptada a tus campos en inglés [cite: 218]
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'description' => 'required',
            'destinatary' => 'required',
            'category_id' => 'required|exists:categories,id',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:4096',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Error de validación', $validator->errors(), 422);
        }

        try {
            if ($file = $request->file('file')) {
                $path = $file->store('petitions', 'public'); // [cite: 230]

                $petition = new Petition($request->all());
                $petition->user_id = Auth::id();
                $petition->signers = 0; // [cite: 234]
                $petition->status = 'pending'; // [cite: 235]
                $petition->save();

                // Relación adaptada [cite: 237]
                $petition->files()->create([
                    'name' => $file->getClientOriginalName(),
                    'file_path' => $path
                ]);

                return $this->sendResponse($petition->load('files'), 'Petición creada con éxito', 201);
            }
            return $this->sendError('El archivo es obligatorio', [], 422);
        } catch (Exception $e) {
            return $this->sendError('Error al crear la petición', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $peticion = Petition::findOrFail($id);

            // Cambia 'update' por 'updatePetition'
            if ($request->user()->cannot('updatePetition', $peticion)) {
                return $this->sendError('No autorizado', [], 403);
            }

            // Asegúrate de que esto reciba un ARRAY
            $peticion->update($request->all());

            return $this->sendResponse($peticion, 'Petición actualizada con éxito');

        } catch (Exception $e) {
            return $this->sendError('Error al actualizar', $e->getMessage(), 500);
        }
    }

    public function firmar(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);
            $user = Auth::user();

            // Verificar si ya firmó (usando tu relación 'firmas') [cite: 268]
            if ($petition->firmas()->where('user_id', $user->id)->exists()) {
                return $this->sendError('Ya has firmado esta petición', [], 403);
            }

            $petition->firmas()->attach($user->id);
            $petition->increment('signers'); // Adaptado: 'firmantes' -> 'signers' [cite: 273]

            return $this->sendResponse($petition, 'Petición firmada con éxito', 201);
        } catch (Exception $e) {
            return $this->sendError('No se pudo firmar la petición', $e->getMessage(), 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);

            if ($request->user()->cannot('delete', $petition)) {
                return $this->sendError('No autorizado', [], 403);
            }

            // Eliminar archivos físicos [cite: 288]
            foreach ($petition->files as $file) {
                Storage::disk('public')->delete($file->file_path);
            }

            $petition->delete();
            return $this->sendResponse(null, 'Petición eliminada con éxito');
        } catch (Exception $e) {
            return $this->sendError('Error al eliminar', $e->getMessage(), 500);
        }
    }
}
