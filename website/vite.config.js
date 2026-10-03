import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({ adapter: adapter(), paths: { base: process.env.BASE_PATH || '' } }),
  ],
  server: { host: '127.0.0.1', port: 8766, strictPort: true },
  preview: { host: '127.0.0.1', port: 8766, strictPort: true },
});
