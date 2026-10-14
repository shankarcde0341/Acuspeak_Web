/**
 * Safe API Base URL Resolution for Acuspeak
 * 
 * Rules.md Compliance:
 * 1. No Hardcoded Network IPs: Never hardcode volatile local IPv4 addresses (10.x, 192.168.x).
 * 2. Same-Origin Proxy: In browser (client-side), returns '' (empty string) so all API requests
 *    use relative paths (/api/...) and are proxied by Next.js rewrites to the FastAPI backend.
 *    This completely bypasses CORS preflight (OPTIONS) checks and cross-device network timeouts.
 * 3. Server-Side Rendering (SSR / Server Components): When running in Node.js where relative URLs
 *    are not automatically resolved to an origin, uses BACKEND_INTERNAL_URL or fallback loopback.
 */
export const API_BASE_URL: string = typeof window === 'undefined'
  ? (process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  : '';

export default API_BASE_URL;
