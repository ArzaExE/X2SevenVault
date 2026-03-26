<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    // ... spread operator serve per accettare un numero variabile di argomenti
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $userRole = $request->auth_role;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'error' => 'Access not authorized',
                'required' => $roles,
                'current' => $userRole,
            ], 403);
        }

        return $next($request);
    }
}
