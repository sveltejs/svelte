// @vitest-environment happy-dom

import * as fs from 'node:fs';
import { assert, describe, it } from 'vitest';
import * as svelte from 'svelte/compiler';
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
			const cwd = `${__dirname}/samples/${dir}`;
			const config = await try_load_config(`${cwd}/_config.js`);

			const input = fs
				.readFileSync(`${cwd}/input.svelte`, 'utf-8')
				.replace(/\s+$/, '')
				.replace(/\r/g, '');

			const expected_warnings = (config.warnings || []).map(normalize_warning);

			const dom = svelte.compile(input, Object.assign({}, config.compileOptions || {}));

			const ssr = svelte.compile(input, Object.assign({}, config.compileOptions || {}));

			assert.equal(dom.css.code, ssr.css.code);

			const dom_warnings = dom.warnings.map(normalize_warning);
			const ssr_warnings = ssr.warnings.map(normalize_warning);

			assert.deepEqual(dom_warnings, ssr_warnings);
			assert.deepEqual(dom_warnings.map(normalize_warning), expected_warnings);

			fs.writeFileSync(`${cwd}/_actual.css`, dom.css.code);
			const expected = {
				html: read(`${cwd}/expected.html`),
				css: read(`${cwd}/expected.css`)
			};

			const actual_css = replace_css_hash(dom.css.code);
			try {
				assert.equal(actual_css, expected.css);
			} catch (error) {
				if (should_update_expected()) {
					fs.writeFileSync(`${cwd}/expected.css`, actual_css);
					console.log(`Updated ${dir}/expected.css.`);
				} else {
					throw error;
				}
			}

			let ClientComponent;
			let ServerComponent;

			// we do this here, rather than in the expected.html !== null
			// block, to verify that valid code was generated
			const load = create_loader({ ...(config.compileOptions || {}) }, cwd);
			try {
				ClientComponent = (await load('input.svelte')).default;
			} catch (err) {
				console.log(dom.js.code);
				throw err;
			}

			const load_ssr = create_loader({ ...(config.compileOptions || {}), generate: 'ssr' }, cwd);
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

				fs.writeFileSync(`${cwd}/_actual.html`, html);

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
	return str.replace(/svelte-[a-z0-9]+/g, 'svelte-xyz');
}

function read(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		return null;
	}
}
