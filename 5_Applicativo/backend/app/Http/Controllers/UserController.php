<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirestoreService;
use Kreait\Firebase\Contract\Auth;

class UserController extends Controller
{
    public function __construct(
        protected FirestoreService $firestore,
        protected Auth $auth
    ) {}

//    TODO: Validation dedicated in another file

    /**
     * Dati utente autenticato
     * GET /api/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'user_id'   => $request->auth_user_id,
            'email'     => $request->auth_user['email'],
            'name'      => $request->auth_user['full_name'],
            'role'      => $request->auth_user['role']['role_name'],
            'is_active' => $request->auth_user['is_active'],
        ]);
    }

    /**
     * Lista tutti gli utenti
     * GET /api/users
     */
    public function index()
    {
        $users = $this->firestore->getCollection('user_management');

        $users = array_map(function ($user) {
            unset($user['password_hash']);
            return $this->formatUser($user);
        }, $users);

        return response()->json($users);
    }

    /**
     * Dettaglio singolo utente
     * GET /api/users/{id}
     */
    public function show(string $id)
    {
        $user = $this->firestore->getUser($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($this->formatUser($user));
    }

    /**
     * Crea nuovo utente
     * POST /api/users
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email'     => 'required|email',
            'full_name' => 'required|string',
            'password'  => 'required|string|min:6',
            'role_id'   => 'required|integer',
            'role_name' => 'required|string',
            'is_active' => 'boolean',
        ]);

        // Crea utente su Firebase Auth
        $firebaseUser = $this->auth->createUserWithEmailAndPassword(
            $validated['email'],
            $validated['password']
        );

        $uid = $firebaseUser->uid;

        // Salva metadati su Firestore
        $this->firestore->setDocument('user_management', $uid, [
            'user_id'   => $uid,
            'email'     => $validated['email'],
            'full_name' => $validated['full_name'],
            'is_active' => $validated['is_active'] ?? true,
            'role'      => [
                'role_id'     => $validated['role_id'],
                'role_name'   => $validated['role_name'],
                'description' => $this->getRoleDescription($validated['role_name']),
            ],
        ]);

        $user = $this->firestore->getUser($uid);
        return response()->json($this->formatUser($user), 201);
    }

    /**
     * Aggiorna utente
     * PUT /api/users/{id}
     */
    public function update(Request $request, string $id)
    {
        $user = $this->firestore->getUser($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|string',
            'role_id'   => 'sometimes|integer',
            'role_name' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['full_name'])) {
            $user['full_name'] = $validated['full_name'];
        }

        if (isset($validated['role_name'])) {
            $user['role'] = [
                'role_id'     => $validated['role_id'],
                'role_name'   => $validated['role_name'],
                'description' => $this->getRoleDescription($validated['role_name']),
            ];
        }

        if (isset($validated['is_active'])) {
            $user['is_active'] = $validated['is_active'];
        }

        $this->firestore->setDocument('user_management', $id, $user);

        return response()->json($this->formatUser($user));
    }

    /**
     * Elimina utente
     * DELETE /api/users/{id}
     */
    public function destroy(string $id)
    {
        // Elimina da Firebase Auth
        $this->auth->deleteUser($id);

        // Elimina da Firestore
        $this->firestore->deleteDocument('user_management', $id);

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Ricerca utenti
     */
    public function searchUsers(string $query): array
    {
        $allUsers = $this->firestore->getCollection('user_management');
        $query = strtolower($query);
        $results = [];

        foreach ($allUsers as $user) {
            $name  = strtolower($user['full_name'] ?? '');
            $email = strtolower($user['email'] ?? '');
            $role  = strtolower($user['role']['role_name'] ?? '');

            $matchesName  = str_contains($name, $query);
            $matchesEmail = str_contains($email, $query);
            $matchesRole  = str_contains($role, $query);

            if ($matchesName || $matchesEmail || $matchesRole) {
                $results[] = $user;
            }
        }

        return $results;
    }

    /**
     * Formatta l'utente per la risposta API
     */
    private function formatUser(array $user): array
    {
        return [
            'id'        => $user['id'] ?? $user['user_id'],
            'user_id'   => $user['user_id'],
            'email'     => $user['email'],
            'name'      => $user['full_name'],
            'role'      => $user['role']['role_name'],
            'role_id'   => $user['role']['role_id'],
            'is_active' => $user['is_active'],
        ];
    }

    private function getRoleDescription(string $roleName): string
    {
        return match($roleName) {
            'admin'    => 'Full system access',
            'operator' => 'Standard operational access',
            default    => 'Limited access',
        };
    }
}
