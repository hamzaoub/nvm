<?php

namespace Database\Seeders;

use App\Models\ExternalServiceCredential;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExternalServiceSeeder extends Seeder
{
    public function run()
    {
        $services = [
            [
                'service_name' => 'Google Vision API',
                'base_url' => 'https://vision.googleapis/v1/images:annotate',
                'description' => 'Credentials for Google Vision API',
            ],
            [
                'service_name' => 'OpenAI',
                'base_url' => 'https://api.openai.com/v1',
                'description' => 'Credentials for OpenAI service',
            ],
            [
                'service_name' => 'IBM Watson',
                'base_url' => 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/12345',
                'description' => 'Credentials for IBM Watson service',
            ],
        ];

        foreach ($services as $service) {
            ExternalServiceCredential::create([
                ...$service,
                'api_key' => (string) Str::uuid(),
                'api_secret' => (string) Str::uuid(),
                'oauth_token' => (string) Str::uuid(),
            ]);
        }
    }
}