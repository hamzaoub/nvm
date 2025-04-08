<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WelcomeController extends Controller
{
    /**
     * Get welcome page data for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'lastName' => $user->lastName,
                'email' => $user->email,
            ],
            'quickLinks' => [
                [
                    'title' => 'Documentation',
                    'url' => '/docs',
                    'icon' => 'document'
                ],
                [
                    'title' => 'Tutorials',
                    'url' => '/tutorials',
                    'icon' => 'video'
                ],
                [
                    'title' => 'FAQ',
                    'url' => '/faq',
                    'icon' => 'question'
                ],
                [
                    'title' => 'Support',
                    'url' => '/support',
                    'icon' => 'support'
                ]
            ],
            'gettingStarted' => [
                [
                    'title' => 'Explore AI Services',
                    'description' => 'Discover our powerful AI capabilities',
                    'url' => '/services'
                ],
                [
                    'title' => 'Dashboard',
                    'description' => 'View your usage and analytics',
                    'url' => '/dashboard'
                ],
                [
                    'title' => 'Profile Settings',
                    'description' => 'Customize your account',
                    'url' => '/settings'
                ],
                [
                    'title' => 'Features',
                    'description' => 'Learn about available features',
                    'url' => '/features'
                ]
            ]
        ]);
    }
}
