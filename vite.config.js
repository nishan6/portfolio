import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Absolute base so the 404 page's assets load from any missing URL (e.g. /work/foo).
// 404.html is built as a second page; Vercel serves dist/404.html for unknown routes.
export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        notfound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
