import * as assert from 'assert';
import * as fs from 'fs';
import { env, normalizeHtml, svelte } from '../helpers.js';

function try_require(file) {
	try {
		const mod = require(file);
		return mod.default || mod;
	} catch (err) {
		if (err.code !== 'MODULE_NOT_FOUND') throw err;
		return null;
	}
}

function normalize_warning(warning) {
	warning.frame = warning.frame
		.replace(/^\n/, '')
		.replace(/^\t+/gm, '')
		.replace(/\s+$/gm, '');
	delete warning.filename;
	delete warning.toString;
	return warning;
}

function create(code) {
	const fn = new Function('module', 'exports', 'require', code);

	const module = { exports: {} };
	fn(module, module.exports, id => {
		if (id === 'svelte') return require('../../index.js');
		if (id.startsWith('svelte/')) return require(id.replace('svelte', '../../'));

		return require(id);
	});

	return module.exports.default;
}

describe('css', () => {
	fs.readdirSync('test/css/samples').forEach(dir => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(solo ? it.only : skip ? it.skip : it)(dir, () => {
			const config = try_require(`./samples/${dir}/_config.js`) || {};
			const input = fs
				.readFileSync(`test/css/samples/${dir}/input.svelte`, 'utf-8')
				.replace(/\s+$/, '');

			const expected_warnings = (config.warnings || []).map(normalize_warning);

			const dom = svelte.compile(
				input,
				Object.assign(config.compileOptions || {}, { format: 'cjs' })
			);

			const ssr = svelte.compile(
				input,
				Object.assign(config.compileOptions || {}, { format: 'cjs', generate: 'ssr' })
			);

			assert.equal(dom.css.code, ssr.css.code);

			const dom_warnings = dom.warnings.map(normalize_warning);
			const ssr_warnings = ssr.warnings.map(normalize_warning);

			assert.deepEqual(dom_warnings, ssr_warnings);
			assert.deepEqual(dom_warnings.map(normalize_warning), expected_warnings);

			fs.writeFileSync(`test/css/samples/${dir}/_actual.css`, dom.css.code);
			const expected = {
				html: read(`test/css/samples/${dir}/expected.html`),
				css: read(`test/css/samples/${dir}/expected.css`)
			};

			assert.equal(dom.css.code.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz'), expected.css);

			// we do this here, rather than in the expected.html !== null
			// block, to verify that valid code was generated
			const ClientComponent = create(dom.js.code);
			const ServerComponent = create(ssr.js.code);

			// verify that the right elements have scoping selectors
			if (expected.html !== null) {
				const window = env();

				// dom
				try {
					const target = window.document.querySelector('main');

					new ClientComponent({ target, props: config.props });
					const html = target.innerHTML;

					fs.writeFileSync(`test/css/samples/${dir}/_actual.html`, html);

					assert.equal(
						normalizeHtml(window, html.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz')),
						normalizeHtml(window, expected.html)
					);

					window.document.head.innerHTML = ''; // remove added styles
				} catch (err) {
					console.log(dom.js.code);
					throw err;
				}

				// ssr
				try {
					assert.equal(
						normalizeHtml(
							window,
							ServerComponent.render(config.props).html.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz')
						),
						normalizeHtml(window, expected.html)
					);
				} catch (err) {
					console.log(ssr.js.code);
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