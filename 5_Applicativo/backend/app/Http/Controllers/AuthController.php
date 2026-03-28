<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthRequest;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class AuthController extends Controller
{
    public function __construct(protected Auth $auth) {}

    public function verify(AuthRequest $request)
    {

        $validated = $request->validated();

        try {
            $verifiedToken = $this->auth->verifyIdToken($validated['token']);

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
