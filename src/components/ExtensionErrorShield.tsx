'use client';

import { useEffect } from 'react';

/**
 * ExtensionErrorShield
 * Prevents third-party browser extensions (e.g. CrossPilot, password managers, adblockers)
 * from triggering Next.js React Dev Overlay crashes when their background message passing times out.
 */
export function ExtensionErrorShield(): null {
  useEffect(() => {
    function isExtensionError(
      err: unknown,
      msg?: string | null,
      src?: string | null
    ): boolean {
      try {
        const errorObj = err as { message?: string; stack?: string } | null;
        const parts: string[] = [
          typeof msg === 'string' ? msg : '',
          typeof src === 'string' ? src : '',
          errorObj && typeof errorObj.message === 'string' ? errorObj.message : '',
          errorObj && typeof errorObj.stack === 'string' ? errorObj.stack : '',
          typeof err === 'string' ? err : '',
        ];
        const combined = parts.join(' ').toLowerCase();

        return (
          combined.includes('chrome-extension://') ||
          combined.includes('moz-extension://') ||
          combined.includes('safari-extension://') ||
          combined.includes('chrome: call method') ||
          combined.includes('migomhggnppjdijnfkiimcpjgnhmnale') ||
          combined.includes('sandbox-content.js') ||
          combined.includes('resizeobserver loop')
        );
      } catch {
        return false;
      }
    }

    const errorHandler = (event: ErrorEvent): void => {
      if (isExtensionError(event.error, event.message, event.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent): void => {
      const reason = event.reason as unknown;
      const msg =
        reason && typeof reason === 'object' && 'message' in reason
          ? (reason as { message: string }).message
          : typeof reason === 'string'
          ? reason
          : '';
      const stack =
        reason && typeof reason === 'object' && 'stack' in reason
          ? (reason as { stack: string }).stack
          : '';

      if (isExtensionError(reason, msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', rejectionHandler, true);

    return () => {
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler, true);
    };
  }, []);

  return null;
}
