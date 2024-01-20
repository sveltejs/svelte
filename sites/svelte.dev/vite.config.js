import { sveltekit } from '@sveltejs/kit/vite';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

/** @type {any[]} */
const plugins = [sveltekit()];

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
