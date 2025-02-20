// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'OpenTPW Format Docs',
			social: {
				github: 'https://github.com/OpenTPW/OpenTPW.FileFormats',
			},
			sidebar: [
				{
					label: 'Formats',
					autogenerate: { directory: 'formats' },
				},
				{
					label: "Ride VM",
					autogenerate: { directory: 'vm' }
				}
			],
		}),
	],
});
