<?php

namespace App\Http\Requests;

use App\Rules\FirestoreDocumentExists;
use App\Services\FirestoreService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ItemUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        \Log::info('ItemUpdateRequest rules called', $this->all());
        $warehouseId = $this->input('warehouse_id');
        $aisleId     = $this->input('aisle_id');
        $firestore = app(FirestoreService::class);

        $rules = [
            'name'        => 'sometimes|string|max:255',
            'is_ai'       => 'boolean',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
            'quantity'    => 'sometimes|integer|min:0|max:1000',

            'height_value' => 'sometimes|numeric|min:0|max:10000',
            'weight_value' => 'sometimes|numeric|min:0|max:10000',
            'width_value'  => 'sometimes|numeric|min:0|max:10000',

            'height_unit'   => 'sometimes|string|in:cm,mm,m',
            'weight_unit'   => 'sometimes|string|in:kg,lbs',
            'width_unit'    => 'sometimes|string|in:cm,mm,m',
        ];

        // Se cambia warehouse → aisle e shelf diventano obbligatori
        if ($this->has('warehouse_id')) {
            $rules['warehouse_id'] = ['required', 'string', 'regex:/^WH_[A-Za-z0-9]+$/',  new FirestoreDocumentExists('warehouse_management')];
            $rules['aisle_id']     = ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles")];
            $rules['shelf_id']     = ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves")];
            return $rules;
        }

        // Se cambia aisle → shelf diventa obbligatorio
        if ($this->has('aisle_id')) {
            // Prende il warehouse_id dall'item esistente
            $existingItem = $firestore->getDocument('item_management', $this->route('id'));
            $existingWarehouseId = $existingItem['warehouse_id'];

            $rules['aisle_id']     = ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$existingWarehouseId}/aisles")];
            $rules['shelf_id']     = ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$existingWarehouseId}/aisles/{$aisleId}/shelves")];
            return $rules;
        }

        // Se cambia solo shelf
        if ($this->has('shelf_id')) {
            $existingItem    = $firestore->getDocument('item_management', $this->route('id'));
            $existingWarehouseId = $existingItem['warehouse_id'];
            $existingAisleId    = $existingItem['aisle_id'];

            $rules['shelf_id']     = ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$existingWarehouseId}/aisles/{$existingAisleId}/shelves")];

        }

        return $rules;
    }
}
