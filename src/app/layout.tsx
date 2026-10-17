import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ExtensionErrorShield } from "@/components/ExtensionErrorShield";

const outfit = localFont({
  src: "../fonts/Outfit.woff2",
  variable: "--font-outfit",
  display: "swap",
});

const manrope = localFont({
  src: "../fonts/Manrope.woff2",
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acuspeak — Speak English with confidence",
  description: "Acuspeak is an English speaking practice app with live voice rooms, structured lessons, and speaking tests built for real-world fluency.",
};

const extensionShieldScript = `
(function() {
  function isExtensionError(err, msg, src) {
    try {
      var parts = [
        typeof msg === 'string' ? msg : '',
        typeof src === 'string' ? src : '',
        err && typeof err.message === 'string' ? err.message : '',
        err && typeof err.stack === 'string' ? err.stack : '',
        typeof err === 'string' ? err : ''
      ];
      var str = parts.join(' ').toLowerCase();
      return (
        str.indexOf('chrome-extension://') !== -1 ||
        str.indexOf('moz-extension://') !== -1 ||
        str.indexOf('safari-extension://') !== -1 ||
        str.indexOf('chrome: call method') !== -1 ||
        str.indexOf('migomhggnppjdijnfkiimcpjgnhmnale') !== -1 ||
        str.indexOf('sandbox-content.js') !== -1 ||
        str.indexOf('resizeobserver loop') !== -1
      );
    } catch (e) {
      return false;
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('error', function(event) {
      if (isExtensionError(event.error, event.message, event.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    }, true);

    window.addEventListener('unhandledrejection', function(event) {
      var reason = event.reason;
      var msg = (reason && typeof reason === 'object' && 'message' in reason) ? reason.message : (typeof reason === 'string' ? reason : '');
      var stack = (reason && typeof reason === 'object' && 'stack' in reason) ? reason.stack : '';
      if (isExtensionError(reason, msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    var origError = console.error;
    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg && (typeof arg === 'string' || typeof arg === 'object')) {
          if (isExtensionError(arg, typeof arg === 'string' ? arg : arg.message, arg && arg.stack)) {
            return;
          }
        }
      }
      return origError.apply(console, args);
    };
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          id="extension-error-shield"
          dangerouslySetInnerHTML={{ __html: extensionShieldScript }}
        />
      </head>
      <body className={`${manrope.variable} ${outfit.variable} font-sans bg-[#F5F8FF] text-[#0F172A] antialiased`} suppressHydrationWarning>
        <ExtensionErrorShield />
        {children}
      </body>
    </html>
  );
}
