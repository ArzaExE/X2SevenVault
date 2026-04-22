<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseStoreRequest;
use App\Http\Requests\WarehouseUpdateRequest;
use App\Services\FirestoreService;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function __construct(
        protected FirestoreService $firestore,
        protected ItemController $itemController
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

    public function showCompleteWarehouses()
    {
        $warehouses = $this->firestore->getCollection('warehouse_management');

        $completeStructure = array_map(function ($whData) {
            // --- FILTRO WAREHOUSE ---
            // Se la warehouse è disattivata, la scartiamo subito
            if (isset($whData['is_active']) && $whData['is_active'] === false) {
                return null;
            }

            $warehouseId = $whData['id'];
            $formattedWh = $this->formatWarehouse($whData);

            // 1. Recupero le corsie
            $allAisles = $this->firestore->getCollection("warehouse_management/{$warehouseId}/aisles");

            // 2. Mappo e filtro le corsie
            $formattedAisles = array_filter(array_map(function ($aisleData) use ($warehouseId) {
                // --- FILTRO AISLE ---
                // Se la corsia è disattivata, la scartiamo
                if (isset($aisleData['is_active']) && $aisleData['is_active'] === false) {
                    return null;
                }

                $aisleId = $aisleData['id'];
                $formattedAisle = $this->formatAisle($aisleData);

                // 3. Recupero gli scaffali
                $shelves = $this->firestore->getCollection("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves");

                // --- FILTRO SHELVES ---
                // Filtriamo gli scaffali attivi
                $activeShelves = array_filter(array_map(function ($shelfData) {
                    if (isset($shelfData['is_active']) && $shelfData['is_active'] === false) {
                        return null;
                    }
                    return $this->formatShelf($shelfData);
                }, $shelves));

                // Se non ci sono scaffali attivi, la corsia non deve essere mostrata
                if (empty($activeShelves)) {
                    return null;
                }

                $formattedAisle['shelves'] = array_values($activeShelves);
                return $formattedAisle;

            }, $allAisles));

            // Se dopo il filtro non sono rimaste corsie valide, la warehouse sparisce
            if (empty($formattedAisles)) {
                return null;
            }

            $formattedWh['aisles'] = array_values($formattedAisles);
            return $formattedWh;

        }, $warehouses);

        // 4. Filtro finale: rimuove tutti i null generati sopra
        $result = array_values(array_filter($completeStructure));

        return response()->json($result);
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

        $warehouse = $this->firestore->getDocument('warehouse_management', $validated['id']);

        if ($warehouse) {
            return response()->json(['error' => "Warehouse with id {$validated['id']} already exists."], 409);
        }

        $store = $this->firestore->setDocument('warehouse_management', $validated['id'], [
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
        ]);

        if (!$store) {
            return response()->json(['error' => 'Error while creating warehouse'], 500);
        }

        $warehouse = $this->firestore->getDocument('warehouse_management', $validated['id']);
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

        $warehouse['id'] = $warehouseId;

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

        $items = $this->itemController->searchItems($warehouseId);

        if($items) {
            return response()->json(['error' => "Can't delete warehouse with items on it"], 409);
        }

        $delete = $this->firestore->deleteRecursive('warehouse_management', $warehouseId);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting warehouse'], 500);
        }

        return response()->json(['message' => 'Warehouse deleted successfully'], 204);
    }

    private function formatWarehouse(array $warehouse): array
    {
        return [
            'id'          => $warehouse['id'],
            'name'        => $warehouse['name'],
            'description' => $warehouse['description'] ?? null,
            'is_active'   => $warehouse['is_active'],
        ];
    }

    private function formatAisle(array $aisle): array
    {
        return [
            'id'           => $aisle['id'],
            'name'         => $aisle['name'],
        ];
    }

    private function formatShelf(array $shelf): array
    {
        return [
            'id'       => $shelf['id'],
            'name'     => $shelf['name'],
        ];
    }
}
