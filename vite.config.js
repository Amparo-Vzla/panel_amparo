import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.js');
				}
			}
		}),
		SvelteKitPWA({
			injectRegister: 'script',
			registerType: 'autoUpdate',
			includeAssets: [
				'favicon.ico',
				'apple-touch-icon.png',
				'favicon-32x32.png',
				'favicon-16x16.png',
				'safari-pinned-tab.svg'
			],
			manifest: {
				name: 'Amparo Venezuela',
				short_name: 'AMPARO',
				description: 'Plataforma civil de gestión de ayuda humanitaria',
				theme_color: '#1e3a8a',
				background_color: '#fafaf9',
				display: 'standalone',
				lang: 'es-VE',
				dir: 'ltr',
				orientation: 'portrait',
				categories: ['humanitarian', 'utilities', 'productivity'],
				start_url: '/',
				scope: '/',
				shortcuts: [
					{
						name: 'Iniciar Sesión',
						short_name: 'Ingresar',
						description: 'Acceder al panel de gestión de ayuda',
						url: '/',
						icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }]
					}
				],
				icons: [
					{
						src: '/web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	]
});
