<?php

namespace Database\Seeders;

use App\Models\AiProject;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AiProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define roles for the projects using IDs
        // 1=admin, 2=user, 3=moderator, null=no restriction
        $roles = [1, 2, 3, null]; // null means no role restriction
        
        // Sample AI projects based on mock data
        $projects = [
            [
                'title' => 'Oceanic Sentiment Analysis',
                'description' => 'Advanced NLP model for analyzing sentiment in customer feedback with specialized capabilities for the maritime industry.',
                'status' => 'active',
                'type' => 'NLP',
                'progress' => 68,
                'image_url' => 'https://images.unsplash.com/photo-1547994770-e5d7a6b40866?q=80&w=2070&auto=format&fit=crop',
                'tags' => ['NLP', 'Sentiment Analysis', 'Customer Feedback'],
            ],
            [
                'title' => 'DeepCoral Image Recognition',
                'description' => 'Computer vision model trained to identify and classify various species of coral reefs from underwater imagery.',
                'status' => 'completed',
                'type' => 'Computer Vision',
                'progress' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1609587292753-0fd46f4c526a?q=80&w=2070&auto=format&fit=crop',
                'tags' => ['Computer Vision', 'Marine Biology', 'Classification'],
            ],
            [
                'title' => 'WavePredictor',
                'description' => 'Time-series forecasting model for predicting ocean wave patterns and maritime conditions using historical weather data.',
                'status' => 'active',
                'type' => 'Forecasting',
                'progress' => 42,
                'tags' => ['Time Series', 'Forecasting', 'Weather'],
            ],
            [
                'title' => 'Tentacle Text Generator',
                'description' => 'GPT-based language model fine-tuned for generating creative oceanic-themed content and stories.',
                'status' => 'pending',
                'type' => 'Generative AI',
                'progress' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1567551057526-bf92350a4c66?q=80&w=2069&auto=format&fit=crop',
                'tags' => ['GPT', 'Text Generation', 'Creative Writing'],
            ],
            [
                'title' => 'MarineChat Assistant',
                'description' => 'Conversational AI specialized in providing information about marine life, ocean conservation, and underwater ecosystems.',
                'status' => 'active',
                'type' => 'Conversational AI',
                'progress' => 76,
                'tags' => ['Chatbot', 'Marine Education', 'Conservation'],
            ],
            [
                'title' => 'OctoTraffic Analyzer',
                'description' => 'Traffic pattern analysis system for maritime routes, helping optimize shipping logistics and reduce fuel consumption.',
                'status' => 'pending',
                'type' => 'Data Analytics',
                'progress' => 28,
                'tags' => ['Logistics', 'Pattern Analysis', 'Optimization'],
            ],
        ];
        
        // Create each project and assign a random role
        foreach ($projects as $projectData) {
            // Get a random role (or null for no role restriction)
            $role = $roles[rand(0, count($roles) - 1)];
            
            // Create the project
            AiProject::create([
                ...$projectData,
                'role' => $role,
                'created_at' => now()->subDays(rand(1, 100)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ]);
        }
    }
}
