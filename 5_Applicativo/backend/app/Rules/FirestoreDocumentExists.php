<?php

namespace App\Rules;

use App\Services\FirestoreService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class FirestoreDocumentExists implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */

    public function __construct(
        protected string $path // path completo es. "warehouse_management/WH_A/aisles/A1"
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $firestore = app(FirestoreService::class);
        $document  = $firestore->getDocumentByPath("{$this->path}/{$value}");

        if (!$document) {
            $fail("The field :attribute doesn't exist.");
        }
    }
}
