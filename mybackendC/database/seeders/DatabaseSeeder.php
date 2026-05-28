<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Petition;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear categorías
        $categories = Category::create(['name' => 'Educación']);
        Category::create(['name' => 'Medio Ambiente']);
        Category::create(['name' => 'Salud']);
        Category::create(['name' => 'Transporte']);
        Category::create(['name' => 'Seguridad']);

        // Crear usuarios de prueba con roles asignados
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@change.org',
            'password' => 'admin123',
            'role' => 'admin'
        ]);

        $user1 = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'role' => 'user'
        ]);

        $user2 = User::create([
            'name' => 'María García',
            'email' => 'maria@example.com',
            'password' => 'password123',
            'role' => 'user'
        ]);

        $user3 = User::create([
            'name' => 'Carlos López',
            'email' => 'carlos@example.com',
            'password' => 'password123',
            'role' => 'user'
        ]);

        // Crear peticiones
        $petition1 = Petition::create([
            'title' => 'Mejorar la infraestructura educativa',
            'description' => 'Necesitamos invertir más en escuelas públicas y modernizar los recursos educativos.',
            'destinatary' => 'Ministerio de Educación',
            'category_id' => 1,
            'user_id' => $user1->id,
            'signers' => 2,
            'status' => 'pending'
        ]);

        $petition2 = Petition::create([
            'title' => 'Crear más zonas verdes en la ciudad',
            'description' => 'Solicitamos la creación de más parques y espacios verdes para mejorar la calidad de vida.',
            'destinatary' => 'Alcaldía Local',
            'category_id' => 2,
            'user_id' => $user2->id,
            'signers' => 2,
            'status' => 'pending'
        ]);

        $petition3 = Petition::create([
            'title' => 'Ampliar cobertura de transporte público',
            'description' => 'Pedimos extender las rutas de autobús a zonas periféricas desatendidas.',
            'destinatary' => 'Secretaría de Movilidad',
            'category_id' => 4,
            'user_id' => $user1->id,
            'signers' => 1,
            'status' => 'pending'
        ]);

        $petition4 = Petition::create([
            'title' => 'Mejorar calidad del agua potable',
            'description' => 'La calidad del agua en nuestra zona necesita mejoras urgentes.',
            'destinatary' => 'Empresa de Servicios Públicos',
            'category_id' => 3,
            'user_id' => $user3->id,
            'signers' => 2,
            'status' => 'pending'
        ]);

        // Agregar firmas a las peticiones (usuarios que apoyan)
        $petition1->firmantes()->attach([$user2->id, $user3->id]);
        $petition2->firmantes()->attach([$user1->id, $user3->id]);
        $petition3->firmantes()->attach([$user2->id]);
        $petition4->firmantes()->attach([$user1->id, $user2->id]);

        // Usuario adicional sin peticiones
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
