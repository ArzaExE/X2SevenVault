<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShelfStoreRequest;
use App\Http\Requests\ShelfUpdateRequest;
use App\Services\FirestoreService;
use Illuminate\Http\Request;

class ShelfController extends Controller
{
    public function __construct(
        protected FirestoreService $firestore
    ) {}

    /**
     * Lista tutti gli scaffali di una corsia
     * GET /api/warehouses/{warehouseId}/aisles/{aisleId}/shelves
     */
    public function index(string $warehouseId, string $aisleId)
    {
        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$aisle) {
            return response()->json(['error' => 'Aisle not found'], 404);
        }

        $shelves = $this->firestore->getCollection("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves");

        $shelves = array_map(function ($shelve) use ($warehouseId, $aisleId) {
            $shelve['warehouse_id'] = $warehouseId;
            $shelve['aisle_id'] = $aisleId;
            return $this->formatShelf($shelve);
        }, $shelves);

        return response()->json($shelves);
    }

    /**
     * Dettaglio singolo scaffale
     * GET /api/warehouses/{warehouseId}/aisles/{aisleId}/shelves/{shelfId}
     */
    public function show(string $warehouseId, string $aisleId, string $shelfId)
    {
        $shelf = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $shelfId);

        if (!$shelf) {
            return response()->json(['error' => 'Shelf not found'], 404);
        }

        $shelf['warehouse_id'] = $warehouseId;
        $shelf['aisle_id'] = $aisleId;

        return response()->json($this->formatShelf($shelf));
    }

    /**
     * Crea nuovo scaffale
     * POST /api/warehouses/{warehouseId}/aisles/{aisleId}/shelves
     */
    public function store(ShelfStoreRequest $request, string $warehouseId, string $aisleId)
    {
        $validated = $request->validated();

        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$aisle) {
            return response()->json(['error' => 'Aisle not found'], 404);
        }

        $shelf = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $validated['shelf_id']);

        if ($shelf) {
            return response()->json(['error' => "Shelf with id {$validated['shelf_id']} already exists."], 404);
        }

        $store = $this->firestore->setDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $validated['shelf_id'], [
            'name'         => $validated['name'],
            'description'  => $validated['description'] ?? null,
            'is_active'    => $validated['is_active'] ?? true,
        ]);

        if (!$store) {
            return response()->json(['error' => 'Error while creating shelf'], 500);
        }

        $shelf = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $validated['shelf_id']);
        $shelf['warehouse_id'] = $warehouseId;
        $shelf['aisle_id'] = $aisleId;
        return response()->json($this->formatShelf($shelf), 201);
    }

    /**
     * Aggiorna scaffale
     * PUT /api/warehouses/{warehouseId}/aisles/{aisleId}/shelves/{shelfId}
     */
    public function update(ShelfUpdateRequest $request, string $warehouseId, string $aisleId, string $shelfId)
    {
        $shelf = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $shelfId);

        if (!$shelf) {
            return response()->json(['error' => 'Shelf not found'], 404);
        }

        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            $shelf[$key] = $value;
        }

        unset($shelf['id']);

        $set = $this->firestore->setDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $shelfId, $shelf);

        if (!$set) {
            return response()->json(['error' => 'Error while updating shelf'], 500);
        }

        $shelf['warehouse_id'] = $warehouseId;
        $shelf['aisle_id'] = $aisleId;
        $shelf['id'] = $shelfId;


        return response()->json($this->formatShelf($shelf));
    }

    /**
     * Elimina scaffale
     * DELETE /api/warehouses/{warehouseId}/aisles/{aisleId}/shelves/{shelfId}
     */
    public function destroy(string $warehouseId, string $aisleId, string $shelfId)
    {
        $shelf = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $shelfId);

        if (!$shelf) {
            return response()->json(['error' => 'Shelf not found'], 404);
        }

        $delete = $this->firestore->deleteDocument("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves", $shelfId);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting shelf'], 500);
        }

        return response()->json(['message' => 'Shelf deleted successfully']);
    }

    private function formatShelf(array $shelf): array
    {
        return [
            'id'           => $shelf['id'],
            'name'         => $shelf['name'],
            'description'  => $shelf['description'] ?? null,
            'is_active'    => $shelf['is_active'],
            'warehouse_id' => $shelf['warehouse_id'],
            'aisle_id'     => $shelf['aisle_id'],
        ];
    }
}
