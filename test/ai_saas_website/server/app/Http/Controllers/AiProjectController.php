<?php

namespace App\Http\Controllers;

use App\Models\AiProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AiProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Get user role and check if admin
            $user = Auth::user();
            $isAdmin = $this->isUserAdmin();
            $userRoles = $this->getUserRoles();
            $userRole = !empty($userRoles) ? $userRoles[0] : null;

            // Get all projects (not filtered by user_id anymore)
            $projects = AiProject::orderBy('created_at', 'desc');

            // If user is admin, show all projects
            if ($isAdmin) {
                // No filtering needed, admin sees all projects
            }
            // If user has a non-admin role, filter by it
            else if ($userRole) {
                $projects = $projects->where(function($query) use ($userRole) {
                    $query->where('role', $userRole)
                          ->orWhereNull('role'); // Also include projects with no role restriction
                });
            }

            $projectsCollection = $projects->get();
            return response()->json($projectsCollection, 200);

        } catch (\Exception $e) {
            Log::error('Error fetching AI projects: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to retrieve projects'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'status' => 'required|in:active,completed,pending',
                'type' => 'required|string|max:255',
                'progress' => 'nullable|integer|min:0|max:100',
                'image_url' => 'nullable|url|max:2048',
                'tags' => 'nullable|array',
                'tags.*' => 'string|max:50',
            ]);

            // Get user role and check if admin
            $user = Auth::user();
            $isAdmin = $this->isUserAdmin();
            $userRoles = $this->getUserRoles();
            $userRole = !empty($userRoles) ? $userRoles[0] : null;

            $project = new AiProject($validated);
            $project->role = $userRole; // Assign the user's role instead of user_id
            $project->save();

            // Format for frontend consumption (consistent with show method)
            $createdProject = [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'status' => $project->status,
                'type' => $project->type,
                'progress' => $project->progress,
                'image_url' => $project->image_url,
                'tags' => $project->tags,
                'role' => $project->role,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ];

            return response()->json($createdProject, 201);
        } catch (\Exception $e) {
            Log::error('Error creating AI project: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create project'], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Get user role and check if admin
            $user = Auth::user();
            $isAdmin = $this->isUserAdmin();
            $userRoles = $this->getUserRoles();
            $userRole = !empty($userRoles) ? $userRoles[0] : null;

            // Base query to find the project by ID
            $query = AiProject::where('id', $id);

            // If user is admin, no filtering needed
            if ($isAdmin) {
                // Admin can see all projects
            }
            // If user has a non-admin role, apply role-based access restriction
            else if ($userRole) {
                $query->where(function($q) use ($userRole) {
                    $q->where('role', $userRole)
                      ->orWhereNull('role');
                });
            }

            $project = $query->firstOrFail();
            
            // Format for frontend consumption
            $formattedProject = [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'status' => $project->status,
                'type' => $project->type,
                'progress' => $project->progress,
                'image_url' => $project->image_url,
                'tags' => $project->tags,
                'role' => $project->role,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ];

            return response()->json($formattedProject, 200);
        } catch (\Exception $e) {
            Log::error('Error fetching AI project details: ' . $e->getMessage());
            return response()->json(['error' => 'Project not found'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            // Get user role and check if admin
            $user = Auth::user();
            $isAdmin = $this->isUserAdmin();
            $userRoles = $this->getUserRoles();
            $userRole = !empty($userRoles) ? $userRoles[0] : null;

            // Base query to find the project by ID
            $query = AiProject::where('id', $id);

            // If user is admin, no filtering needed
            if ($isAdmin) {
                // Admin can see all projects
            }
            // If user has a non-admin role, apply role-based access restriction
            else if ($userRole) {
                $query->where(function($q) use ($userRole) {
                    $q->where('role', $userRole)
                      ->orWhereNull('role');
                });
            }

            $project = $query->firstOrFail();

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status' => 'sometimes|in:active,completed,pending',
                'type' => 'sometimes|string|max:255',
                'progress' => 'sometimes|nullable|integer|min:0|max:100',
                'image_url' => 'sometimes|nullable|url|max:2048',
                'tags' => 'sometimes|nullable|array',
                'tags.*' => 'string|max:50',
            ]);

            $project->update($validated);

            // Format for frontend consumption (consistent with show method)
            $updatedProject = [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'status' => $project->status,
                'type' => $project->type,
                'progress' => $project->progress,
                'image_url' => $project->image_url,
                'tags' => $project->tags,
                'role' => $project->role,
                'created_at' => $project->created_at,
                'updated_at' => $project->updated_at,
            ];

            return response()->json($updatedProject, 200);
        } catch (\Exception $e) {
            Log::error('Error updating AI project: ' . $e->getMessage());

            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json(['error' => 'Project not found'], 404);
            }

            return response()->json(['error' => 'Failed to update project'], 500);
        }
    }

    /**
     * Check if the current user has admin role
     *
     * @param Request $request
     * @return array
     */
    public function checkRoles(Request $request)
    {
        $user = $request->user();
        $roles = $user->roles->pluck('name');

        return [
            'isAdmin' => $roles->contains('admin'),
            'roles' => $roles
        ];
    }

    /**
     * Check if the current user is an admin
     *
     * @return bool
     */
    private function isUserAdmin(): bool
    {
        $user = Auth::user();
        $roles = $user->roles->pluck('name');
        return $roles->contains('admin');
    }

    /**
     * Get user roles as array
     *
     * @return array
     */
    private function getUserRoles(): array
    {
        $user = Auth::user();
        return $user->roles->pluck('name')->toArray();
    }
    /**
     * Remove the specified resource from storage.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Get user role and check if admin
            $user = Auth::user();
            $isAdmin = $this->isUserAdmin();
            $userRoles = $this->getUserRoles();
            $userRole = !empty($userRoles) ? $userRoles[0] : null;

            // Base query to find the project by ID
            $query = AiProject::where('id', $id);

            // If user is admin, no filtering needed
            if ($isAdmin) {
                // Admin can see all projects
            }
            // If user has a non-admin role, apply role-based access restriction
            else if ($userRole) {
                $query->where(function($q) use ($userRole) {
                    $q->where('role', $userRole)
                      ->orWhereNull('role');
                });
            }

            $project = $query->firstOrFail();

            $project->delete();

            return response()->json(['message' => 'Project deleted successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error deleting AI project: ' . $e->getMessage());

            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json(['error' => 'Project not found'], 404);
            }

            return response()->json(['error' => 'Failed to delete project'], 500);
        }
    }
}
