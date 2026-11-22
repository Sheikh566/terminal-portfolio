import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapterCloudflare(),
			paths: {
				// The site is prerendered, so canonical/OG URLs need a real origin at build time
				origin: 'https://sabdullah.com'
			}
		})
	]
});
