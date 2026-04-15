<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
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
        // TODO: Review rules
        return [
            'email'     => 'sometimes|email:rfc,dns',
            'full_name' => 'sometimes|string',
            'role_id'   => 'sometimes|integer',
            'role_name' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
