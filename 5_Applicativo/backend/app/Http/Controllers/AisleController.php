<?php

namespace App\Http\Controllers;

use App\Http\Requests\AisleStoreRequest;
use App\Http\Requests\AisleUpdateRequest;
use App\Services\FirestoreService;
use Illuminate\Http\Request;

class AisleController extends Controller
{
    public function __construct(
        protected FirestoreService $firestore
    ) {}

    /**
     * Lista tutte le corsie di un warehouse
     * GET /api/warehouses/{warehouseId}/aisles
     */
    public function index(Request $request, string $warehouseId)
    {
        $warehouse = $this->firestore->getDocument('warehouse_management', $warehouseId);

        if (!$warehouse) {
            return response()->json(['error' => 'Warehouse not found'], 404);
        }

        $aisles = $this->firestore->getCollection("warehouse_management/{$warehouseId}/aisles");


        $aisles = array_map(function ($aisle) use ($warehouseId) {
            $aisle['warehouse_id'] = $warehouseId;
            return $this->formatAisle($aisle);
        }, $aisles);

        return response()->json($aisles);
    }

    /**
     * Dettaglio singola corsia
     * GET /api/warehouses/{warehouseId}/aisles/{aisleId}
     */
    public function show(string $warehouseId, string $aisleId)
    {
        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$aisle) {
            return response()->json(['error' => 'Aisle not found'], 404);
        }

        $aisle['warehouse_id'] = $warehouseId;

        return response()->json($this->formatAisle($aisle));
    }

    /**
     * Crea nuova corsia
     * POST /api/warehouses/{warehouseId}/aisles
     */
    public function store(AisleStoreRequest $request, string $warehouseId)
    {
        $validated = $request->validated();

        $warehouse = $this->firestore->getDocument('warehouse_management', $warehouseId);

        if (!$warehouse) {
            return response()->json(['error' => 'Warehouse not found'], 404);
        }

        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $validated['aisle_id']);

        if ($aisle) {
            return response()->json(['error' => "Aisle with id {$validated['aisle_id']} already exists."], 404);
        }

        $store = $this->firestore->setDocument("warehouse_management/{$warehouseId}/aisles", $validated['aisle_id'], [
            'name'         => $validated['name'],
            'description'  => $validated['description'] ?? null,
            'is_active'    => $validated['is_active'] ?? true
        ]);

        if (!$store) {
            return response()->json(['error' => 'Error while creating aisle'], 500);
        }

        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $validated['aisle_id']);
        $aisle['warehouse_id'] = $warehouseId;
        return response()->json($this->formatAisle($aisle), 201);
    }

    /**
     * Aggiorna corsia
     * PUT /api/warehouses/{warehouseId}/aisles/{aisleId}
     */
    public function update(AisleUpdateRequest $request, string $warehouseId, string $aisleId)
    {
        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$aisle) {
            return response()->json(['error' => 'Aisle not found'], 404);
        }

        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            $aisle[$key] = $value;
        }

        unset($aisle['id']);

        $set = $this->firestore->setDocument("warehouse_management/{$warehouseId}/aisles", $aisleId, $aisle);

        if (!$set) {
            return response()->json(['error' => 'Error while updating aisle'], 500);
        }

        $aisle['warehouse_id'] = $warehouseId;

        return response()->json($this->formatAisle($aisle));
    }

    /**
     * Elimina corsia
     * DELETE /api/warehouses/{warehouseId}/aisles/{aisleId}
     */
    public function destroy(string $warehouseId, string $aisleId)
    {
        $aisle = $this->firestore->getDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$aisle) {
            return response()->json(['error' => 'Aisle not found'], 404);
        }

        $delete = $this->firestore->deleteDocument("warehouse_management/{$warehouseId}/aisles", $aisleId);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting aisle'], 500);
        }

        return response()->json(['message' => 'Aisle deleted successfully']);
    }

    private function formatAisle(array $aisle): array
    {
        return [
            'name'         => $aisle['name'],
            'description'  => $aisle['description'] ?? null,
            'is_active'    => $aisle['is_active'],
            'warehouse_id' => $aisle['warehouse_id'],
        ];
    }
}
