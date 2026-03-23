<?php

namespace App\Http\Middleware;

use App\Services\FirestoreService;
use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class FirebaseAuth
{
    public function __construct(
        protected Auth $auth,
        protected FirestoreService $firestore
    ) {}

    public function handle(Request $request, Closure $next) // le richieste HTTP passano attraverso dei middleware**, uno dopo l'altro. `$next` rappresenta il prossimo step della catena.
    {
        $token = $request->bearerToken(); // Restituisce la parte di token senza bearer

        if (!$token) {
            return response()->json(['error' => 'Token is missing'], 401);
        }

        try {
            $verifiedToken = $this->auth->verifyIdToken($token);
            $userId = $verifiedToken->claims()->get('sub');

            // Recupera l'utente da Firestore
            $user = $this->firestore->getUser($userId);

            if (!$user) {
                return response()->json(['error' => 'User not find'], 404);
            }

            // Blocca utenti disabilitati
            if (!$user['is_active']) {
                return response()->json(['error' => 'User disabled'], 403);
            }

            // Inietta i dati utente nella request per usarli nei controller
            $request->merge([
                'auth_user_id'   => $userId,
                'auth_user'      => $user,
                'auth_role'      => $user['role']['role_name'],
                'auth_role_id'   => $user['role']['role_id'],
            ]);

        } catch (FailedToVerifyToken $e) {
            return response()->json(['error' => 'Token not valid'], 401);
        }

        return $next($request);
    }
}
