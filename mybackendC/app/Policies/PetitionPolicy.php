<?php

namespace App\Policies;

use App\Models\Petition;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PetitionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Petition $Petition): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }
    /**
     * Determine whether the user can update the model.
     */
    // Cambia el nombre de 'update' a 'updatePetition'
    public function updatePetition(User $user, Petition $petition): bool
    {
        return $user->id === $petition->user_id; // [cite: 104]
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Petition $Petition): bool
    {
        return $Petition->user_id == $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Petition $Petition): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Petition $Petition): bool
    {
        return false;
    }

    public function firmar(User $user, Petition $Petition)
    {
        return $user->id != $Petition->user_id;
    }
}
