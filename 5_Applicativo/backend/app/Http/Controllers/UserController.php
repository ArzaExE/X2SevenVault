<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
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
//    TODO: Try-catch for manage exception

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
     * Aggiorna i dati dell'utente autenticato (solo full_name)
     * PUT /api/me
     */
    public function updateMe(ProfileUpdateRequest $request)
    {

        $validated = $request->validated();

        $uid = $request->auth_user_id;

        $user = $this->firestore->getUser($uid);

        if ($request->has('full_name')) {
            $user['full_name'] = $validated['full_name'];
        }

        if ($request->has('email')) {
            $user['email'] = $validated['email'];
            $this->auth->changeUserEmail($uid, $validated['email']);
        }

        // Aggiorna solo su Firestore
        $set = $this->firestore->setDocument('user_management', $uid, $user);

        if (!$set) {
            return response()->json(['error' => 'Error while saving user'], 404);
        }

        $user = $this->firestore->getUser($uid);
        return response()->json($this->formatUser($user));
    }

    /**
     * Aggiorna la password dell'utente autenticato
     * PUT /api/me/password
     */
    public function updatePassword(PasswordUpdateRequest $request)
    {
        // Non viene chiesto all'utente la sua password attuale perchè è già autenticato con il token
        $validated = $request->validated();

        $uid = $request->auth_user_id;

        // Aggiorna solo su Firebase Auth — Firestore non gestisce password
        $this->auth->changeUserPassword($uid, $validated['password']);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Lista tutti gli utenti
     * GET /api/users
     */
    public function index()
    {
        $users = $this->firestore->getCollection('user_management');

        if (!$users) {
            return response()->json(['error' => 'Users not found'], 404);
        }

        $users = array_map(function ($user) {
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
    public function store(UserStoreRequest $request)
    {
        $validated = $request->validated();
        // Crea utente su Firebase Auth
        $firebaseUser = $this->auth->createUserWithEmailAndPassword(
            $validated['email'],
            $validated['password']
        );

        $uid = $firebaseUser->uid;

        // Salva metadati su Firestore
        $set = $this->firestore->setDocument('user_management', $uid, [
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

        if (!$set) {
            return response()->json(['error' => 'Error adding user'], 404);
        }

        $user = $this->firestore->getUser($uid);
        return response()->json($this->formatUser($user), 201);
    }

    /**
     * Aggiorna utente
     * PUT /api/users/{id}
     */
    public function update(UserUpdateRequest $request, string $id)
    {
        $user = $this->firestore->getUser($id);

        $validated = $request->validated();

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

        $set = $this->firestore->setDocument('user_management', $id, $user);
        if (!$set) {
            return response()->json(['error' => 'Error while saving user'], 404);
        }

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
        $delete = $this->firestore->deleteDocument('user_management', $id);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting user'], 404);
        }

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
