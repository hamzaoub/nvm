<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'sanctum/csrf-cookie',
        'api/auth/google/callback',
        'webhook/stripe'
    ];

    /**
     * Determine if the request has a valid CSRF token.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function tokensMatch($request)
    {
        $sessionToken = $request->session()->token();

        $token = $request->input('_token') ?: $request->header('X-CSRF-TOKEN');

        if (!$token && $header = $request->header('X-XSRF-TOKEN')) {
            try {
                $token = urldecode($header);
            } catch (\Exception $e) {
                return false;
            }
        }

        if (!is_string($token)) {
            return false;
        }

        return hash_equals($sessionToken, $token);
    }

    /**
     * Add the CSRF token to the response cookies.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function addCookieToResponse($request, $response)
    {
        $response = parent::addCookieToResponse($request, $response);
        
        // Ensure the cookie is accessible via JavaScript
        if ($response->headers->has('Set-Cookie')) {
            $cookies = $response->headers->getCookies();
            foreach ($cookies as $cookie) {
                if ($cookie->getName() === 'XSRF-TOKEN') {
                    $response->headers->setCookie(
                        new \Symfony\Component\HttpFoundation\Cookie(
                            'XSRF-TOKEN',
                            $cookie->getValue(),
                            0,
                            '/',
                            null,
                            false,
                            false,
                            false,
                            'Lax'
                        )
                    );
                }
            }
        }

        return $response;
    }
}
