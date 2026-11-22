import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: vitePreprocess(),
			// Deployed by Cloudflare Pages, which adapter-cloudflare no longer supports
			// as of v9. The site is fully prerendered, so adapter-static fits exactly.
			// Output goes where the Pages project's build output directory points.
			adapter: adapterStatic({
				pages: '.svelte-kit/cloudflare',
				// Pages serves 404.html with a 404 status for unknown URLs
				fallback: '404.html'
			}),
			paths: {
				// The site is prerendered, so canonical/OG URLs need a real origin at build time
				origin: 'https://sabdullah.com'
			}
		})
	]
});
