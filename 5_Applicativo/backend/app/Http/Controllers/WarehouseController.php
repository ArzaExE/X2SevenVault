<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseStoreRequest;
use App\Http\Requests\WarehouseUpdateRequest;
use App\Services\FirestoreService;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function __construct(
        protected FirestoreService $firestore
    ) {}

    /**
     * Lista di tutte le warehouse
     * GET /api/warehouses
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $warehouses = $this->firestore->getCollection('warehouse_management');

        // TODO: integrate search system
//        if ($search) {
//            $query = strtolower($search);
//            $warehouses = array_filter($warehouses, function ($warehouse) use ($query) {
//                $name        = strtolower($warehouse['name'] ?? '');
//                $description = strtolower($warehouse['description'] ?? '');
//                return str_contains($name, $query) || str_contains($description, $query);
//            });
//        }

        $warehouses = array_map(function ($warehouse) {
            return $this->formatWarehouse($warehouse);
        }, $warehouses);

        return response()->json($warehouses);
    }

    /**
     * Dettaglio singolo warehouse
     * GET /api/warehouses/{warehouseId}
     */
    public function show(string $warehouseId)
    {
        $warehouse = $this->firestore->getDocument('warehouse_management', $warehouseId);

        if (!$warehouse) {
            return response()->json(['error' => 'Warehouse not found'], 404);
        }

        return response()->json($this->formatWarehouse($warehouse));
    }

    /**
     * Crea nuovo warehouse
     * POST /api/warehouses
     */
    public function store(WarehouseStoreRequest $request)
    {
        $validated = $request->validated();

        $warehouse = $this->firestore->getDocument('warehouse_management', $validated['warehouse_id']);

        if ($warehouse) {
            return response()->json(['error' => "Warehouse with id {$validated['warehouse_id']} already exists."], 404);
        }

        $store = $this->firestore->setDocument('warehouse_management', $validated['warehouse_id'], [
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        if (!$store) {
            return response()->json(['error' => 'Error while creating warehouse'], 500);
        }

        $warehouse = $this->firestore->getDocument('warehouse_management', $validated['warehouse_id']);
        return response()->json($this->formatWarehouse($warehouse), 201);
    }

    /**
     * Aggiorna warehouse
     * PUT /api/warehouses/{warehouseId}
     */
    public function update(WarehouseUpdateRequest $request, string $warehouseId)
    {
        $warehouse = $this->firestore->getDocument('warehouse_management', $warehouseId);

        if (!$warehouse) {
            return response()->json(['error' => 'Warehouse not found'], 404);
        }

        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            $warehouse[$key] = $value;
        }

        unset($warehouse['id']);

        $set = $this->firestore->setDocument('warehouse_management', $warehouseId, $warehouse);

        if (!$set) {
            return response()->json(['error' => 'Error while updating warehouse'], 500);
        }

        return response()->json($this->formatWarehouse($warehouse));
    }

    /**
     * Elimina warehouse
     * DELETE /api/warehouses/{warehouseId}
     */
    public function destroy(string $warehouseId)
    {
        $warehouse = $this->firestore->getDocument('warehouse_management', $warehouseId);

        if (!$warehouse) {
            return response()->json(['error' => 'Warehouse not found'], 404);
        }

        $delete = $this->firestore->deleteDocument('warehouse_management', $warehouseId);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting warehouse'], 500);
        }

        return response()->json(['message' => 'Warehouse deleted successfully']);
    }

    private function formatWarehouse(array $warehouse): array
    {
        return [
            'name'        => $warehouse['name'],
            'description' => $warehouse['description'] ?? null,
            'is_active'   => $warehouse['is_active'],
        ];
    }
}
