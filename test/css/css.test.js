// @vitest-environment happy-dom

import * as fs from 'fs';
import { assert, describe, it } from 'vitest';
import * as svelte from '../../compiler.mjs';
import { create_loader, should_update_expected, try_load_config } from '../helpers.js';
import { assert_html_equal } from '../html_equal.js';

function normalize_warning(warning) {
	warning.frame = warning.frame.replace(/^\n/, '').replace(/^\t+/gm, '').replace(/\s+$/gm, '');
	delete warning.filename;
	delete warning.toString;
	return warning;
}

describe('css', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		const it_fn = solo ? it.only : skip ? it.skip : it;

		it_fn(dir, async () => {
			const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);

			const input = fs
				.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8')
				.replace(/\s+$/, '')
				.replace(/\r/g, '');

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

			fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.css`, dom.css.code);
			const expected = {
				html: read(`${__dirname}/samples/${dir}/expected.html`),
				css: read(`${__dirname}/samples/${dir}/expected.css`)
			};

			const actual_css = replace_css_hash(dom.css.code);
			try {
				assert.equal(actual_css, expected.css);
			} catch (error) {
				if (should_update_expected()) {
					fs.writeFileSync(`${__dirname}/samples/${dir}/expected.css`, actual_css);
					console.log(`Updated ${dir}/expected.css.`);
				} else {
					throw error;
				}
			}

			const cwd = `${__dirname}/samples/${dir}`;

			let ClientComponent;
			let ServerComponent;

			// we do this here, rather than in the expected.html !== null
			// block, to verify that valid code was generated
			const load = create_loader({ ...(config.compileOptions || {}), format: 'cjs' }, cwd);
			try {
				ClientComponent = (await load('input.svelte')).default;
			} catch (err) {
				console.log(dom.js.code);
				throw err;
			}

			const load_ssr = create_loader(
				{ ...(config.compileOptions || {}), generate: 'ssr', format: 'cjs' },
				cwd
			);
			try {
				ServerComponent = (await load_ssr('input.svelte')).default;
			} catch (err) {
				console.log(dom.js.code);
				throw err;
			}

			// verify that the right elements have scoping selectors
			if (expected.html !== null) {
				const target = window.document.createElement('main');

				new ClientComponent({ target, props: config.props });
				const html = target.innerHTML;

				fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.html`, html);

				const actual_html = replace_css_hash(html);
				assert_html_equal(actual_html, expected.html);

				window.document.head.innerHTML = ''; // remove added styles

				const actual_ssr = replace_css_hash(ServerComponent.render(config.props).html);
				assert_html_equal(actual_ssr, expected.html);
			}
		});
	});
});

function replace_css_hash(str) {
	return str.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => ($1 ? m : 'svelte-xyz'));
}

function read(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		return null;
	}
}
