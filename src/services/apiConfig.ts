/**
 * Safe Dynamic API Base URL Resolution for Acuspeak
 * 
 * Rules.md & Security Architecture Compliance:
 * 1. No Hardcoded Network IPs: Never hardcode volatile local IPv4 addresses (10.x, 192.168.x) or ports in client code.
 * 2. Dynamic Environment Resolution: Checks process.env.NEXT_PUBLIC_API_URL first.
 *    - In browser runtime (client-side): Falls back to '' (empty string) when NEXT_PUBLIC_API_URL is unset or empty,
 *      ensuring all API requests use relative paths (/api/...) proxied via Next.js rewrites to the FastAPI backend.
 *      This completely eliminates CORS preflight (OPTIONS) roundtrips, IP volatility, and cross-device network timeouts.
 *    - In Node.js runtime (SSR / Server Components / Server Actions): If NEXT_PUBLIC_API_URL is not set,
 *      resolves to process.env.BACKEND_INTERNAL_URL or loopback 'http://127.0.0.1:8000' to satisfy Node.js
 *      absolute URL requirements for fetch.
 */
export const API_BASE_URL: string = (
  typeof window === 'undefined'
    ? (process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000')
    : (process.env.NEXT_PUBLIC_API_URL || '')
).replace(/\/$/, '');

export default API_BASE_URL;
