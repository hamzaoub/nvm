<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CategoryType;

class CategoryTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Create main category types
        CategoryType::create([
            'name' => 'AI Services',
            'description' => 'Categories for AI services',
            'machine_name' => 'ai_services',
            'is_flat' => false,
            'order' => 1,
            'status' => true
        ]);

        CategoryType::create([
            'name' => 'Content Types',
            'description' => 'Types of content that can be generated',
            'machine_name' => 'content_types',
            'is_flat' => false,
            'order' => 2,
            'status' => true
        ]);

        CategoryType::create([
            'name' => 'Industry Verticals',
            'description' => 'Industry-specific categories',
            'machine_name' => 'industry_verticals',
            'is_flat' => true,
            'order' => 3,
            'status' => true
        ]);

        CategoryType::create([
            'name' => 'Use Cases',
            'description' => 'Different use cases for AI services',
            'machine_name' => 'use_cases',
            'is_flat' => false,
            'order' => 4,
            'status' => true
        ]);
    }
}