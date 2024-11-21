import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
			protocolImports: true,
		}),
	],
	ssr: {
		noExternal: ['@fuels/*', 'svelte-fuels']
	},
	define: {
		'process.env.NODE_DEBUG': 'false',
		'global': 'globalThis'
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			output: {
				format: 'esm'
			}
		}
	},
	server: {
		fs: {
			allow: ['.']
		}
	}
});
