import { sveltekit } from '@sveltejs/kit/vite';
import * as fs from 'fs';

const plugins = [raw(['.ttf']), sveltekit()];

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
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return { code: `export default ${JSON.stringify(buffer)}`, map: null };
			}
		}
	};
}

/** @type {import('vite').UserConfig} */
const config = {
	logLevel: 'info',
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
