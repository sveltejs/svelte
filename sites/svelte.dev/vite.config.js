import { sveltekit } from '@sveltejs/kit/vite';
import { browserslistToTargets } from 'lightningcss';
import { readFile } from 'node:fs/promises';
import browserslist from 'browserslist';
import { transformWithEsbuild } from 'vite';

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

/** @returns {import('vite').Plugin} */
function minified_raw_plugin() {
	const prefix = 'minified-raw:';

	return {
		name: 'minified-raw-js',
		async resolveId(id, importer) {
			if (id.startsWith(prefix)) {
				const resolved = await this.resolve(id.slice(prefix.length), importer, { skipSelf: true });
				return '\0' + prefix + resolved.id;
			}
		},
		async load(id) {
			if (id.startsWith('\0' + prefix)) {
				const real_id = id.slice(1 + prefix.length);
				const original = await readFile(real_id, 'utf-8');
				const { code } = await transformWithEsbuild(original, real_id, {
					minify: true,
					format: 'esm'
				});
				return `export default ${JSON.stringify(code)}`;
			}
		}
	};
}

/** @type {import('vite').Plugin[]} */
const plugins = [raw(['.ttf']), sveltekit(), minified_raw_plugin()];

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
