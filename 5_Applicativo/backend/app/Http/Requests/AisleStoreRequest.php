<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AisleStoreRequest extends FormRequest
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

        return [
            'aisle_id'    => ['required', 'string', 'regex:/^[A-Z][0-9]+$/'], // Una lettera maiuscola e uno o più numeri
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'boolean',
        ];
    }

    public function messages(): array
    {
        $warehouseId = $this->route('warehouse');

        return [
            'aisle_id.required' => 'The aisle ID is required.',
            'aisle_id.regex'    => "The aisle ID must be the letter and the number of the aisle. (e.g: A2, D42, C77).",
        ];
    }
}
