<?php

use App\Http\Controllers\AisleController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ShelfController;
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
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{id}', [ItemController::class, 'show']);
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
    Route::post('/items', [ItemController::class, 'store']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    // Warehouses
    Route::apiResource('warehouses', WarehouseController::class);

    // Aisles (annidate dentro warehouse)
    Route::apiResource('warehouses.aisles', AisleController::class);

    // Shelves (annidate dentro aisle)
    Route::apiResource('warehouses.aisles.shelves', ShelfController::class);


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
