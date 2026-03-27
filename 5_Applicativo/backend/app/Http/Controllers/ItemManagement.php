<?php

namespace App\Http\Controllers;

use App\Services\FirestoreService;
use Illuminate\Http\Request;

class ItemManagement extends Controller
{
    public function __construct(
        protected FirestoreService $firestore
    ) {}

    /**
     * Lista tutti gli items
     * GET /api/items
     */
    public function index()
    {
        $items = $this->firestore->getCollection('item_management');

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
        $item = $this->firestore->getItem($id);

        if (!$item) {
            return response()->json(['error' => 'Item not found'], 404);
        }

        return response()->json($this->formatItem($item));
    }

    /**
     * Crea nuovo item
     * POST /api/items
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ai_class_id'   => 'required|string',
            // TODO: check if ids exists
            'aisle_id'      => 'required|string',
            'shelf_id'      => 'required|string',
            'warehouse_id'  => 'required|string',

            'description'   => 'nullable|string|max:1000',
            'is_active'     => 'boolean',
            'quantity'      => 'required|integer|min:0',

            'height_value'  => 'required|numeric|min:0',
            'weight_value'  => 'required|numeric|min:0',
            'width_value'   => 'required|numeric|min:0',

            // Puoi usare 'in:cm,mm,m' per restringere le unità permesse
            'height_unit'   => 'required|string|max:10',
            'weight_unit'   => 'required|string|max:10',
            'width_unit'    => 'required|string|max:10',
        ]);


        // Salva metadati su Firestore
        $uid = $this->firestore->createDocument('item_management', [
            'ai_class_id'   => $validated['ai_class_id'],
            'aisle_id'      => $validated['aisle_id'],
            'description'   => $validated['description'] ?? null,
            'is_active'     => $validated['is_active'] ?? true,
            'quantity'      => $validated['quantity'],
            'shelf_id'      => $validated['shelf_id'],
            'warehouse_id'  => $validated['warehouse_id'],

            // Struttura per le proprietà fisiche
            'physical_properties' => [
                'height' => [
                    'unit'  => $validated['height_unit'],
                    'value' => $validated['height_value'],
                ],
                'weight' => [
                    'unit'  => $validated['weight_unit'],
                    'value' => $validated['weight_value'],
                ],
                'width' => [
                    'unit'  => $validated['width_unit'],
                    'value' => $validated['width_value'],
                ],
            ],
        ]);

        $item = $this->firestore->getItem($uid);
        $item['item_id'] = $uid;
        $this->firestore->setDocument('item_management', $uid, $item);
        return response()->json($this->formatItem($item), 201);
    }


    /**
     * Aggiorna item
     * PUT /api/items/{id}
     */
    public function update(Request $request, string $id)
    {
        $item = $this->firestore->getItem($id);

        $validated = $request->validate([
            'ai_class_id'   => 'sometimes|string',
            // TODO: check if ids exists
            'aisle_id'      => 'sometimes|string',
            'shelf_id'      => 'sometimes|string',
            'warehouse_id'  => 'sometimes|string',

            'description'   => 'nullable|string|max:1000',
            'is_active'     => 'boolean',
            'quantity'      => 'sometimes|integer|min:0',

            'height_value'  => 'sometimes|numeric|min:0',
            'weight_value'  => 'sometimes|numeric|min:0',
            'width_value'   => 'sometimes|numeric|min:0',

            // Puoi usare 'in:cm,mm,m' per restringere le unità permesse
            'height_unit'   => 'sometimes|string|max:10',
            'weight_unit'   => 'sometimes|string|max:10',
            'width_unit'    => 'sometimes|string|max:10',
        ]);

        // 1. Mappatura automatica: "chiave_request" => "percorso_nell_array_item"
        foreach ($validated as $key => $value) {

            // Gestione proprietà fisiche (es: height_value -> physical_properties['height']['value'])
            if (str_contains($key, '_value') || str_contains($key, '_unit')) {
                [$type, $prop] = explode('_', $key); // Es: [height, value]
                $item['physical_properties'][$type][$prop] = $value;
            }
            // Gestione campi normali (top level)
            else {
                $item[$key] = $value;
            }
        }

        $this->firestore->setDocument('item_management', $id, $item);

        return response()->json($this->formatItem($item));
    }

    public function destroy(string $id)
    {
        $this->firestore->deleteDocument('item_management', $id);

        return response()->json(['message' => 'Item deleted successfully']);
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

            $ai_class_id  = strtolower($item['ai_class_id'] ?? '');
            $aisle_id     = strtolower($item['aisle_id'] ?? '');
            $description  = strtolower($item['description'] ?? '');
            $item_id      = strtolower($item['item_id'] ?? '');
            $name         = strtolower($item['name'] ?? '');
            $shelf_id     = strtolower($item['shelf_id'] ?? '');
            $warehouse_id = strtolower($item['warehouse_id'] ?? '');

            $matchesAi_class  = str_contains($ai_class_id, $query);
            $matchesAisle     = str_contains($aisle_id, $query);
            $matchesDesc      = str_contains($description, $query);
            $matchesItem      = str_contains($item_id, $query);
            $matchesName      = str_contains($name, $query);
            $matchesShelf     = str_contains($shelf_id, $query);
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
            'ai_class_id'   => $item['ai_class_id'],
            'aisle_id'      => $item['aisle_id'],
            'description'   => $item['description'],
            'is_active'     => $item['is_active'],
            'item_id'       => $item['item_id'],
            'height_unit'   => $item['physical_properties']['height']['unit'],
            'height_value'  => $item['physical_properties']['height']['value'],
            'weight_unit'   => $item['physical_properties']['weight']['unit'],
            'weight_value'  => $item['physical_properties']['weight']['value'],
            'width_unit'    => $item['physical_properties']['width']['unit'],
            'width_value'   => $item['physical_properties']['width']['value'],
            'quantity'      => $item['quantity'],
            'shelf_id'      => $item['shelf_id'],
            'warehouse_id'  => $item['warehouse_id'],

        ];
    }

}
