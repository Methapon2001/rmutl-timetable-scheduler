import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
      },
      '/websocket': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
});
