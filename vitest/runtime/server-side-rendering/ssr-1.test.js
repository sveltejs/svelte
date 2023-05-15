// @vitest-environment jsdom

// Yes it's an SSR test, but we need the env to compare html
// TODO: Isolate the html comparison
// TODO: happy-dom might be faster but currently replaces quotes which fails assertions

import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
import { assert, describe, it } from 'vitest';
import {
	should_update_expected,
	try_load_config,
	try_load_json,
	try_read_file
} from '../../helpers';
import { assert_html_equal } from '../../html_equal';

const sveltePath = process.cwd().split('\\').join('/');

describe('ssr', async () => {
	async function run_test(dir) {
		if (dir[0] === '.') return;

		const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);

		const solo = config.solo || /\.solo/.test(dir);
		const it_fn = solo ? it.only : it;

		it_fn(dir, () => {
			dir = path.resolve(`${__dirname}/samples`, dir);

			const require = createRequire(import.meta.url);
			const compileOptions = {
				sveltePath,
				...config.compileOptions,
				generate: 'ssr',
				format: 'cjs'
			};

			require('../../../register.js')(compileOptions);

			const Component = require(`${dir}/main.svelte`).default;

			const expectedHtml = try_read_file(`${dir}/_expected.html`);
			const expectedCss = try_read_file(`${dir}/_expected.css`) || '';

			const props = try_load_json(`${dir}/data.json`) || undefined;

			const rendered = Component.render(props);
			const { html, css, head } = rendered;

			fs.writeFileSync(`${dir}/_actual.html`, html);
			if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

			try {
				assert_html_equal(html, expectedHtml, {
					normalize_html: { preserveComments: compileOptions.preserveComments },
					without_normalize: config.withoutNormalizeHtml
				});
			} catch (error) {
				if (should_update_expected()) {
					fs.writeFileSync(`${dir}/_expected.html`, html);
					console.log(`Updated ${dir}/_expected.html.`);
				} else {
					error.message += '\n' + `${dir}/main.svelte`;
					throw error;
				}
			}

			try {
				assert.equal(
					css.code.trim().replace(/[\r\n]/g, ''),
					expectedCss.trim().replace(/[\r\n]/g, '')
				);
			} catch (error) {
				if (should_update_expected()) {
					fs.writeFileSync(`${dir}/_expected.css`, css.code);
					console.log(`Updated ${dir}/_expected.css.`);
				} else {
					error.message += '\n' + `${dir}/main.svelte`;
					throw error;
				}
			}

			if (fs.existsSync(`${dir}/_expected-head.html`)) {
				fs.writeFileSync(`${dir}/_actual-head.html`, head);

				try {
					assert_html_equal(head, fs.readFileSync(`${dir}/_expected-head.html`, 'utf-8'), {
						normalize_html: { preserveComments: compileOptions.hydratable }
					});
				} catch (error) {
					if (should_update_expected()) {
						fs.writeFileSync(`${dir}/_expected-head.html`, head);
						console.log(`Updated ${dir}/_expected-head.html.`);
						error.message += '\n' + `${dir}/main.svelte`;
					} else {
						throw error;
					}
				}
			}
		});
	}

	await Promise.all(fs.readdirSync(`${__dirname}/samples`).map(run_test));
});
