import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@fuels/*', 'svelte-fuels'],
	},
	resolve: {
		alias: {
			crypto: 'crypto-browserify',
			stream: 'stream-browserify',
			assert: 'assert',
			util: 'util',
			buffer: 'buffer',
			process: 'process/browser',
		}
	},
	define: {
		'process.env.NODE_DEBUG': 'false',
		'global': 'globalThis',
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			}
		},
		include: [
			'crypto-browserify',
			'stream-browserify',
			'assert',
			'buffer',
			'util',
			'process/browser'
		],
		exclude: ['@fuels/*', 'svelte-fuels']
	}
});
