<?php

namespace App\Http\Middleware;

use App\Services\FirestoreService;
use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class FirebaseAuth
{
    // constructor property promotion:
    // invece di scrivere prima le proprietà della classe e poi assegnarle dentro il costruttore,
    // si dichiarano direttamente nei parametri del costruttore.
    public function __construct(
        // variabili accessibili dalla classe e dalle estensione ma non direttamente dall'esterno
        protected Auth $auth,
        protected FirestoreService $firestore
    ) {}

    public function handle(Request $request, Closure $next) // le richieste HTTP passano attraverso dei middleware, uno dopo l'altro. `$next` rappresenta il prossimo step della catena.
    {
        $token = $request->bearerToken(); // Restituisce la parte di token senza bearer

        if (!$token) {
            return response()->json(['error' => 'Token is missing'], 401);
        }

        try {
            $verifiedToken = $this->auth->verifyIdToken($token);
            $userId = $verifiedToken->claims()->get('sub'); //le claims sono le informazioni dell'utente, sub rappresenta la claim dell'id dell'utente

            $user = $this->firestore->getUser($userId);

            if (!$user) {
                return response()->json(['error' => 'User not find'], 404);
            }

            if (!$user['is_active']) {
                return response()->json(['error' => 'User disabled'], 403);
            }

            // Dati utente nella request per usarli come identificazione di chi sta facendo la richiesta
            $request->merge([
                'auth_user_id'   => $userId,
                'auth_user'      => $user,
                'auth_role'      => $user['role']['role_name'],
                'auth_role_id'   => $user['role']['role_id'],
            ]);

        } catch (FailedToVerifyToken) {
            return response()->json(['error' => 'Token not valid'], 401);
        }

        return $next($request);
    }
}
