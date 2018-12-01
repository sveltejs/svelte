import * as assert from 'assert';
import * as fs from 'fs';
import { env, normalizeHtml, svelte } from '../helpers.js';

function tryRequire(file) {
	try {
		const mod = require(file);
		return mod.default || mod;
	} catch (err) {
		if (err.code !== 'MODULE_NOT_FOUND') throw err;
		return null;
	}
}

function normalizeWarning(warning) {
	warning.frame = warning.frame
		.replace(/^\n/, '')
		.replace(/^\t+/gm, '')
		.replace(/\s+$/gm, '');
	delete warning.filename;
	delete warning.toString;
	return warning;
}

describe.only('css', () => {
	fs.readdirSync('test/css/samples').forEach(dir => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(solo ? it.only : skip ? it.skip : it)(dir, () => {
			const config = tryRequire(`./samples/${dir}/_config.js`) || {};
			const input = fs
				.readFileSync(`test/css/samples/${dir}/input.html`, 'utf-8')
				.replace(/\s+$/, '');

			const expectedWarnings = (config.warnings || []).map(normalizeWarning);
			const warnings = [];

			const { js, css } = svelte.compile(
				input,
				Object.assign(config, {
					format: 'cjs',
					name: 'SvelteComponent',
					onwarn: warning => {
						warnings.push(warning);
					}
				})
			);

			// we do this here, rather than in the expected.html !== null
			// block, to verify that valid code was generated
			const fn = new Function('module', 'exports', 'require', js.code);

			console.log(warnings);
			console.log(expectedWarnings);
			assert.deepEqual(warnings.map(normalizeWarning), expectedWarnings);

			fs.writeFileSync(`test/css/samples/${dir}/_actual.css`, css.code);
			const expected = {
				html: read(`test/css/samples/${dir}/expected.html`),
				css: read(`test/css/samples/${dir}/expected.css`)
			};

			assert.equal(css.code.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz'), expected.css);

			// verify that the right elements have scoping selectors
			if (expected.html !== null) {
				const window = env();

				const module = { exports: {} };
				fn(module, module.exports, id => {
					if (id === 'svelte') return require('../../index.js');
					if (id.startsWith('svelte/')) return require(id.replace('svelte', '../../'));

					return require(id);
				});

				const { default: Component, $render } = module.exports;

				try {
					// dom
					const target = window.document.querySelector('main');

					new Component({ target, props: config.props });
					const html = target.innerHTML;

					fs.writeFileSync(`test/css/samples/${dir}/_actual.html`, html);

					assert.equal(
						normalizeHtml(window, html.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz')),
						normalizeHtml(window, expected.html)
					);

					window.document.head.innerHTML = ''; // remove added styles

					// ssr
					assert.equal(
						normalizeHtml(
							window,
							$render(config.props).html.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz')
						),
						normalizeHtml(window, expected.html)
					);
				} catch (err) {
					console.log(js.code);
					throw err;
				}
			}
		});
	});
});

function read(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		return null;
	}
}