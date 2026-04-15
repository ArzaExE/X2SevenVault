<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemStoreRequest;
use App\Http\Requests\ItemUpdateRequest;
use App\Services\FirestoreService;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    // TODO: change return status code (Item and User)
    public function __construct(
        protected FirestoreService $firestore
    )
    {}

    /**
     * Lista tutti gli items
     * GET /api/items
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $items = $search
            ? $this->searchItems($search)
            : $this->firestore->getCollection('item_management');

        $items = array_map(function ($item) {
            return $this->formatItem($item);
        }, $items);

        return response()->json($items);
    }

    /**
     * Dettaglio singolo item
     * GET /api/items/{id}
     */
    public function show(string $id)
    {
        $item = $this->firestore->getDocument('item_management', $id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        return response()->json($this->formatItem($item));
    }

    /**
     * Crea nuovo item
     * POST /api/items
     */
    public function store(ItemStoreRequest $request)
    {
        $validated = $request->validated();

        $physicalProperties = [
            'height' => ['unit' => $validated['height_unit'], 'value' => $validated['height_value']],
            'weight' => ['unit' => $validated['weight_unit'], 'value' => $validated['weight_value']],
            'width' => ['unit' => $validated['width_unit'], 'value' => $validated['width_value']],
        ];

        if (isset($validated['is_ai']) && $validated['is_ai']) {
            $ai_class_id = $this->generateAiId();
        }



        $id = $this->firestore->createDocument('item_management', array_merge(
            \Arr::only($validated, ['name', 'aisle_id', 'description', 'quantity', 'shelf_id', 'warehouse_id']),
            ['is_ai'   => $validated['is_ai'] ?? false],
            ['ai_class_id' => $ai_class_id ?? null],
            ['is_active' => $validated['is_active'] ?? true],
            ['physical_properties' => $physicalProperties]
        ));



        if (!$id) {
            return response()->json(['error' => 'Error while creating item'], 500);
        }

        $item = $this->firestore->getDocument('item_management', $id);

        return response()->json($this->formatItem($item), 201);
    }


    /**
     * Aggiorna item
     * PUT /api/items/{id}
     */
    public function update(ItemUpdateRequest $request, string $id)
    {
        $item = $this->firestore->getDocument('item_management', $id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        unset($item['id']);

        $validated = $request->validated();

        // Mappatura chiave valore.
        // Esempio: $validated['is_ai'] = true --> $key = 'is_ai' $value = true
        foreach ($validated as $key => $value) {

            // Gestione proprietà fisiche, viene gestito diversamente perchè è un array annidato
            if (str_contains($key, '_value') || str_contains($key, '_unit')) {
                // Divide la chiave in 2 variabili
                // Esempio: height_value, $type = height e $prop = value
                [$type, $prop] = explode('_', $key);
                $item['physical_properties'][$type][$prop] = $value;
            } // Gestione campi normali (top level)
            else {
                $item[$key] = $value;
            }
        }

        if (!isset($item['ai_class_id'])) {
            if ($item['is_ai'] && !$item['ai_class_id']) {
                $item['ai_class_id'] = $this->generateAiId();
            }
        }

        $set = $this->firestore->setDocument('item_management', $id, $item);
        if (!$set) {
            return response()->json(['error' => 'Error while updating item'], 500);
        }

        $item['id'] = $id;

        return response()->json($this->formatItem($item));
    }

    public function destroy(string $id)
    {
        $item = $this->firestore->getDocument('item_management', $id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        $delete = $this->firestore->deleteDocument('item_management', $id);

        if (!$delete) {
            return response()->json(['error' => 'Error while deleting item'], 500);
        }

        return response()->json(['message' => 'Item deleted successfully'], 204);
    }

    /**
     * Ricerca items
     */
    public function searchItems(string $query): array
    {
        $allItems = $this->firestore->getCollection('item_management');
        $query = strtolower($query);
        $results = [];

        foreach ($allItems as $item) {

            $ai_class_id = strtolower($item['ai_class_id'] ?? '');
            $aisle_id = strtolower($item['aisle_id'] ?? '');
            $description = strtolower($item['description'] ?? '');
            $item_id = strtolower($item['item_id'] ?? '');
            $name = strtolower($item['name'] ?? '');
            $shelf_id = strtolower($item['shelf_id'] ?? '');
            $warehouse_id = strtolower($item['warehouse_id'] ?? '');

            $matchesAi_class = str_contains($ai_class_id, $query);
            $matchesAisle = str_contains($aisle_id, $query);
            $matchesDesc = str_contains($description, $query);
            $matchesItem = str_contains($item_id, $query);
            $matchesName = str_contains($name, $query);
            $matchesShelf = str_contains($shelf_id, $query);
            $matchesWarehouse = str_contains($warehouse_id, $query);

            if (
                $matchesAi_class ||
                $matchesAisle ||
                $matchesDesc ||
                $matchesItem ||
                $matchesName ||
                $matchesShelf ||
                $matchesWarehouse
            ) {
                $results[] = $item;
            }
        }

        return $results;
    }

    private function formatItem(array $item): array
    {
        return [
            'id' => $item['id'],
            'name' => $item['name'],
            'is_ai' => $item['is_ai'],
            'ai_class_id' => $item['ai_class_id'],
            'aisle_id' => $item['aisle_id'],
            'description' => $item['description'],
            'is_active' => $item['is_active'],
            'height_unit' => $item['physical_properties']['height']['unit'],
            'height_value' => $item['physical_properties']['height']['value'],
            'weight_unit' => $item['physical_properties']['weight']['unit'],
            'weight_value' => $item['physical_properties']['weight']['value'],
            'width_unit' => $item['physical_properties']['width']['unit'],
            'width_value' => $item['physical_properties']['width']['value'],
            'quantity' => $item['quantity'],
            'shelf_id' => $item['shelf_id'],
            'warehouse_id' => $item['warehouse_id'],

        ];
    }

    /**
     * Funzione che genera un ID per l'AI
     * Funzione scritta dall'AI
     *
     * random_bytes(15) → 15 byte casuali (120 bit)
     * base64_encode() → converte in base64 (ottenendo 20 caratteri + possibili padding)
     * str_replace(['+', '/', '='], '') → rimuove caratteri non URL-safe e padding
     * substr(..., 0, 20) → assicura esattamente 20 caratteri
     *
     */

    private function generateAiId(): string
    {
        return substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(15))), 0, 20);
    }

}
