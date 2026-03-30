<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\WarehouseController;
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

// TODO: find a non-redundant method

Route::middleware('firebase.auth')->group(function () {

    // Gestione utente singolo
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'updateMe']);
    Route::put('/me/password', [UserController::class, 'updatePassword']);

    // Gestione items
    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/items/{id}', [ItemController::class, 'show']);
    Route::post('/items', [ItemController::class, 'store']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    // Gestione Warehouses
    //DELETE /api/warehouses/{warehouseId}

    Route::get('/warehouses', [WarehouseController::class, 'index']);
    Route::get('/warehouses/{id}', [WarehouseController::class, 'show']);
    Route::post('/warehouses', [WarehouseController::class, 'store']);
    Route::put('/warehouses/{id}', [WarehouseController::class, 'update']);
    Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy']);



    // Users — solo admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::get('/users/search/{query}', [UserController::class, 'searchUsers']);
    });

});
