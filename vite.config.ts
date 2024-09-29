import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption } from 'vite';
import { fileURLToPath } from 'node:url';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const viteServerConfig = {
	name: 'log-request-middleware',
	configureServer(server: any) {
		server.middlewares.use((req: any, res: any, next: any) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET');
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			next();
		});
	}
};

export default defineConfig({
	plugins: [wasm(), topLevelAwait(), sveltekit(), purgeCss(), viteServerConfig],
	worker: {
		plugins: () => [wasm() as PluginOption, topLevelAwait() as PluginOption],
		optimizeDeps: {
			exclude: ['@ffmpeg/core/wasm']
		}
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core/wasm']
	},
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp'
		},
		fs: {
			allow: ['../..']
		}
	},
	build: {
		rollupOptions: {
			external: [/^\@ffmpeg\/core\/wasm*/]
		}
	}
});
