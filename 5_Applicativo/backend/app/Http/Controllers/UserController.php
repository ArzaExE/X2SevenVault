<?php

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(protected FirestoreService $firestore) {}

    /**
     * Dati dell'utente autenticato
     * GET /api/me
     */
    public function me(Request $request)
    {
        return response()->json([
            'user_id'  => $request->auth_user_id,
            'email'    => $request->auth_user['email'],
            'name'     => $request->auth_user['full_name'],
            'role'     => $request->auth_user['role']['role_name'],
            'is_active'=> $request->auth_user['is_active'],
        ]);
    }

    /**
     * Lista tutti gli utenti (solo admin)
     * GET /api/users
     */
    public function index()
    {
        $users = $this->firestore->getCollection('user_management');

        $users = array_map(function ($user) {
            return $user;
        }, $users);

        return response()->json($users);
    }
}
