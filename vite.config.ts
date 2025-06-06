import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: ['clsx', 'cookie', 'devalue', 'set-cookie-parser']
    }
  }
});