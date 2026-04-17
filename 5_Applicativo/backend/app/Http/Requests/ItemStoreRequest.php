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
            'is_ai'   => 'boolean', // true/false field on frontend, if true auto generate it

            'warehouse_id' => ['required', 'string', 'regex:/^WH_[A-Za-z0-9]+$/', new FirestoreDocumentExists('warehouse_management'),],
            'aisle_id' => ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles")],
            'shelf_id' => ['required', 'string', 'regex:/^[A-Z][0-9]+$/', new FirestoreDocumentExists("warehouse_management/{$warehouseId}/aisles/{$aisleId}/shelves")],

            'description'   => 'nullable|string|max:1000',
            'is_active'     => 'boolean',
            'quantity'      => 'required|integer|min:0|max:1000',

            'height_value'  => 'required|numeric|min:0|max:10000',
            'weight_value'  => 'required|numeric|min:0|max:10000',
            'width_value'   => 'required|numeric|min:0|max:10000',

            // Puoi usare 'in:cm,mm,m' per restringere le unità permesse
            'height_unit'   => 'required|string|in:cm,mm,m',
            'weight_unit'   => 'required|string|in:g,kg,lbs',
            'width_unit'    => 'required|string|in:cm,mm,m',
        ];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => 'The warehouse ID is required.',
            'warehouse_id.regex'    => 'The warehouse ID must start with WH_ followed by alphanumeric characters (e.g. WH_A).',
            'aisle_id.required' => 'The aisle ID is required.',
            'aisle_id.regex'    => "The aisle ID must be the letter and the number of the aisle. (e.g: A2, D42, C77).",
            'shelf_id.required' => 'The shelf ID is required.',
            'shelf_id.regex'    => 'The shelf ID must be the letter and the number of the aisle. (e.g: S2, D42, C77).',
        ];
    }
}
