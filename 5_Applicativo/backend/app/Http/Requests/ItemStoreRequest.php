<?php

namespace App\Http\Requests;

use App\Rules\FirestoreDocumentExists;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ItemStoreRequest extends FormRequest
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
        //TODO: Explain the code
        $warehouseId = $this->input('warehouse_id');
        $aisleId     = $this->input('aisle_id');

        return [
            'name' => 'required|string|max:255',
            'ai_class_id'   => 'nullable|string', // true/false field on frontend, if true auto generate it

            'warehouse_id' => ['required', 'string', new FirestoreDocumentExists('warehouse_management')],
            'aisle_id' => ['required', 'string', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles")],
            'shelf_id' => ['required', 'string', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves")],

            'description'   => 'nullable|string|max:1000',
            'is_active'     => 'boolean',
            'quantity'      => 'required|integer|min:0',

            'height_value'  => 'required|numeric|min:0',
            'weight_value'  => 'required|numeric|min:0',
            'width_value'   => 'required|numeric|min:0',

            // Puoi usare 'in:cm,mm,m' per restringere le unità permesse
            'height_unit'   => 'required|string|in:cm,mm,m',
            'weight_unit'   => 'required|string|in:kg,lbs',
            'width_unit'    => 'required|string|in:cm,mm,m',
        ];
    }
}
