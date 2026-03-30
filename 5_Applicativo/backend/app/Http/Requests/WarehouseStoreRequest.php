<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WarehouseStoreRequest extends FormRequest
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
            /**
             * Spiegazione regex.
             * ^WH_ -> deve iniziare con WH_
             * [A-Za-z0-9]+ --> seguito da almeno un carattere alfanumerico
             * $ --> fine stringa
             */
            'warehouse_id' => ['required', 'string', 'regex:/^WH_[A-Za-z0-9]+$/'],
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string|max:1000',
            'is_active'    => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'warehouse_id.required' => 'The warehouse ID is required.',
            'warehouse_id.regex'    => 'The warehouse ID must start with WH_ followed by alphanumeric characters (e.g. WH_A).',
        ];
    }
}
