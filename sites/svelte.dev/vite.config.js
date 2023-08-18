import { sveltekit } from '@sveltejs/kit/vite';
import { browserslistToTargets } from 'lightningcss';
import { readFile } from 'node:fs/promises';
import browserslist from 'browserslist';
import { transformWithEsbuild } from 'vite';

/** @type {import('vite').Plugin[]} */
const plugins = [
	raw(['.ttf']),
	sveltekit(),
	{
		name: 'minified-raw-js',

		async load(id) {
			if (id.endsWith('.js?minified')) {
				const file = id.replace('?minified', '');
				let code = await readFile(file, 'utf-8');
				return `export default ${JSON.stringify(
					(await transformWithEsbuild(code, file, { minify: true, format: 'esm' })).code
				)}`;
			}
		}
	}
];

// Only enable sharp if we're not in a webcontainer env
if (!process.versions.webcontainer) {
	plugins.push(
		(await import('vite-imagetools')).imagetools({
			defaultDirectives: (url) => {
				if (url.searchParams.has('big-image')) {
					return new URLSearchParams('w=640;1280;2560;3840&format=avif;webp;png&as=picture');
				}

				return new URLSearchParams();
			}
		})
	);
}

/**
 * @param {string[]} ext
 * @returns {import("vite").Plugin}
 */
function raw(ext) {
	return {
		name: 'vite-plugin-raw',
		async transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = await readFile(id);
				return { code: `export default ${JSON.stringify(buffer)}`, map: null };
			}
		}
	};
}

/** @type {import('vite').UserConfig} */
const config = {
	logLevel: 'info',
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist(['>0.2%', 'not dead']))
		}
	},
	build: {
		cssMinify: 'lightningcss'
	},
	plugins,
	optimizeDeps: {
		exclude: ['@sveltejs/site-kit', '@sveltejs/repl']
	},
	ssr: { noExternal: ['@sveltejs/site-kit', '@sveltejs/repl'] },
	server: {
		fs: {
			strict: false
		}
	}
};

export default config;
