<?php

namespace Database\Seeders;

use App\Models\AiServiceCategory;
use App\Models\AiService;
use Illuminate\Database\Seeder;

class AiServiceSeeder extends Seeder
{
    public function run()
    {
        // Create Categories
        $imageProcessing = AiServiceCategory::create([
            'name' => 'Image Processing',
        ]);

        $nlp = AiServiceCategory::create([
            'name' => 'Natural Language Processing',
        ]);

        // Create Services
        AiService::create([
            'name' => 'Image Segmentation',
            'description' => 'Segmentation of objects in images using AI algorithms.',
            'endpoint' => 'http://example.com/image-segmentation',
            'cost' => 25,
            'category_id' => $imageProcessing->id,
        ]);

        AiService::create([
            'name' => 'Text Sentiment Analysis',
            'description' => 'Analysis of sentiment in text data using AI techniques.',
            'endpoint' => 'http://example.com/sentiment-analysis',
            'cost' => 12,
            'category_id' => $nlp->id,
        ]);
    }
} 