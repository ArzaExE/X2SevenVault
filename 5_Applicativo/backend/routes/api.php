<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Route pubbliche — senza token
|--------------------------------------------------------------------------
*/

// Verifica token Firebase
Route::post('/auth/verify', [AuthController::class, 'verify']);

/*
|--------------------------------------------------------------------------
| Route protette — richiedono token Firebase valido
|--------------------------------------------------------------------------
*/

Route::middleware('firebase.auth')->group(function () {

    // Dati utente autenticato
    Route::get('/me', [UserController::class, 'me']);

    // Lista tutti gli utenti (solo admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
    });

});
