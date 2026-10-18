/**
 * Purpose: Configure SvelteKit and Tailwind compilation for the static website.
 *
 * Main contents:
 * - Entry-point configuration and its validation/output lifecycle.
 *
 * Used By: Vite development/build commands.
 *
 * Uses: no local module imports.
 *
 * Libs: vite (build configuration), @sveltejs/kit/vite (SvelteKit compilation),
 * @sveltejs/adapter-static (prerendered static output), @tailwindcss/vite (shared CSS
 * compilation).
 */
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({ adapter: adapter(), paths: { base: process.env.BASE_PATH || '' } }),
  ],
  server: {
    host: '127.0.0.1',
    port: 8766,
    strictPort: true,
    // The local puzzle package is symlinked outside SvelteKit's default serving paths.
    fs: { allow: ['./vendor/puzzles'] },
  },
  preview: { host: '127.0.0.1', port: 8766, strictPort: true },
});
