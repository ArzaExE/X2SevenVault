<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Google\Cloud\Firestore\FirestoreClient;

class TestFirestore extends Command
{
    protected $signature = 'test:firestore';
    protected $description = 'Test connessione Firestore';

    public function handle()
    {
        $this->info('Connessione a Firestore...');

        try {
            $db = new FirestoreClient([
                'projectId'   => 'x2sevenvault-db',
                'keyFilePath' => base_path('firebase-credentials.json'),
                'transport'   => 'rest',
                'restOptions' => [
                    'timeout' => 10,
                ],
            ]);

            $this->info('Client creato, leggo documento...');

            $doc = $db->collection('user_management')
                ->document('X5watCRdsRNLtFhjnUgPhclm9e72')
                ->snapshot();

            if ($doc->exists()) {
                $this->info('Documento trovato!');
                $this->info(json_encode($doc->data()));
            } else {
                $this->warn('Documento non trovato');
            }

        } catch (\Throwable $e) {
            $this->error('Errore: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile() . ' linea ' . $e->getLine());
        }
    }
}
