<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class AuthController extends Controller
{
    public function __construct(protected Auth $auth) {}

    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        try {
            $verifiedToken = $this->auth->verifyIdToken($request->token);

            return response()->json([
                'valid'   => true,
                'user_id' => $verifiedToken->claims()->get('sub'),
                'email'   => $verifiedToken->claims()->get('email'),
            ]);

        } catch (FailedToVerifyToken $e) {
            return response()->json([
                'valid'   => false,
                'error'   => 'Token not valid or expired',
            ], 401);
        }
    }
}
