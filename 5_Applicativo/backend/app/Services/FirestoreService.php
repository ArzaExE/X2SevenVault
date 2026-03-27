<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Google\Auth\Credentials\ServiceAccountCredentials;

class FirestoreService
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = env('FIRESTORE_BASE_URL');

        // Creazione dell'oggetto ServiceAccountCredentials con le credenziali del file fornito da firestore
        $credentials = new ServiceAccountCredentials(
            env('GOOGLE_SCOPE'),
            json_decode(file_get_contents(base_path(env('FIREBASE_CREDENTIALS'))), true) // con true trasforma in array il risultato, senza si ha un oggetto.
        );

        // Si ottiene il token da Google (OAuth) a partire dalle credenziali istanziate in precedenza
        $token = $credentials->fetchAuthToken();
        $this->token = $token['access_token'];
    }

    public function getUser(string $userId): ?array
    {
        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/user_management/{$userId}");

        if ($response->failed()) {
            return null;
        }

        return $this->parseDocument($response->json());
    }

    public function getItem(string $itemId): ?array
    {
        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/item_management/{$itemId}");

        if ($response->failed()) {
            return null;
        }

        return $this->parseDocument($response->json());
    }

    public function getCollection(string $collection): array
    {
        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/{$collection}");

        if ($response->failed()) {
            return [];
        }

        $results = [];
        foreach ($response->json()['documents'] ?? [] as $doc) {
            $results[] = $this->parseDocument($doc);
        }
        return $results;
    }

    public function createDocument(string $collection, array $data): string
    {
        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/{$collection}", [
                'fields' => $this->encodeFields($data)
            ]);

        $name = $response->json()['name'];
        return basename($name);
    }

    public function setDocument(string $collection, string $id, array $data): bool
    {
        $response = Http::withToken($this->token)
            ->patch("{$this->baseUrl}/{$collection}/{$id}", [
                'fields' => $this->encodeFields($data)
            ]);

        if ($response->failed()) {
            return false;
        }

        return true;
    }

    public function deleteDocument(string $collection, string $id): bool
    {
        $response = Http::withToken($this->token)
            ->delete("{$this->baseUrl}/{$collection}/{$id}");

        if ($response->failed()) {
            return false;
        }

        return true;

    }

    /**
     * Converte il formato Firestore REST in array PHP normale
     */
    protected function parseDocument(array $doc): array
    {
        $result = [];
        foreach ($doc['fields'] ?? [] as $key => $value) {
            $result[$key] = $this->parseValue($value);
        }
        // Aggiungi l'ID documento
        if (isset($doc['name'])) {
            $result['id'] = basename($doc['name']);
        }
        return $result;
    }

    protected function parseValue(array $value): mixed
    {
        if (isset($value['stringValue']))  return $value['stringValue'];
        if (isset($value['integerValue'])) return (int) $value['integerValue'];
        if (isset($value['doubleValue']))  return (float) $value['doubleValue'];
        if (isset($value['booleanValue'])) return (bool) $value['booleanValue'];
        if (isset($value['nullValue']))    return null;
        if (isset($value['mapValue']))     return $this->parseDocument($value['mapValue']);
        if (isset($value['arrayValue'])) {
            return array_map(
                fn($v) => $this->parseValue($v),
                $value['arrayValue']['values'] ?? []
            );
        }
        return null;
    }

    protected function encodeFields(array $data): array
    {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->encodeValue($value);
        }
        return $fields;
    }

    protected function encodeValue(mixed $value): array
    {
        if (is_string($value))  return ['stringValue' => $value];
        if (is_int($value))     return ['integerValue' => $value];
        if (is_float($value))   return ['doubleValue' => $value];
        if (is_bool($value))    return ['booleanValue' => $value];
        if (is_null($value))    return ['nullValue' => null];
        if (is_array($value))   return ['mapValue' => ['fields' => $this->encodeFields($value)]];
        return ['stringValue' => (string) $value];
    }
}
