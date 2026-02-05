import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md']
		})
	],
	kit: {
		adapter: adapter(),

		experimental: {
			tracing: {
				server: true
			},

			instrumentation: {
				server: true
			}
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				console.error(`Error prerendering ${path} (referred from ${referrer}): ${message}`);
			},
			handleUnseenRoutes: ({ routes }) => {
				console.error(`Error prerendering unseen routes: ${routes}`);
			}
		}
	}
};

export default config;