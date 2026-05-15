import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import baseManifest from './manifest.json';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');

    const supabaseUrl = env.VITE_SUPABASE_URL;
    const apiUrl = env.VITE_DECKSWAP_API_URL;
    const appUrl = env.VITE_DECKSWAP_APP_URL;

    if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is not set');
    if (!apiUrl) throw new Error('VITE_DECKSWAP_API_URL is not set');
    if (!appUrl) throw new Error('VITE_DECKSWAP_APP_URL is not set');

    if (mode === 'production') {
        if (!apiUrl.startsWith('https://'))
            throw new Error('VITE_DECKSWAP_API_URL must use HTTPS in production');
        if (!appUrl.startsWith('https://'))
            throw new Error('VITE_DECKSWAP_APP_URL must use HTTPS in production');
        if (env.VITE_DEV_TOOLS === 'true')
            throw new Error('VITE_DEV_TOOLS must be false in production');
    }

    // Restrict what extension pages (side panel, background) can connect to.
    // inlineScan / inlineDetect run inside the Cardmarket tab, not extension pages,
    // so Cardmarket fetch() calls are governed by Cardmarket's own CSP.
    const connectSrc = ["'self'", new URL(supabaseUrl).origin, new URL(apiUrl).origin].join(' ');

    const manifest = {
        ...baseManifest,
        // CSP is only applied in production — Vite HMR in dev requires inline
        // scripts and WebSocket connections that a strict CSP would block.
        ...(mode === 'production' && {
            content_security_policy: {
                extension_pages: `script-src 'self'; object-src 'none'; img-src 'self'; connect-src ${connectSrc};`,
            },
        }),
    };

    return {
        plugins: [react(), tailwindcss(), crx({ manifest })],
        build: {
            sourcemap: false,
        },
        server: {
            port: 5173,
            strictPort: true,
            hmr: { port: 5173 },
            cors: { origin: '*' },
        },
    };
});
