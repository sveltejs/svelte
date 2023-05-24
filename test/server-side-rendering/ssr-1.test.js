// @vitest-environment jsdom

// Yes it's an SSR test, but we need the env to compare html
// TODO: Isolate the html comparison
// TODO: happy-dom might be faster but currently replaces quotes which fails assertions

import * as fs from 'node:fs';
import * as path from 'node:path';
import { assert, describe, it } from 'vitest';
import {
	create_loader,
	should_update_expected,
	try_load_config,
	try_load_json,
	try_read_file
} from '../helpers.js';
import { assert_html_equal_with_options } from '../html_equal.js';

describe('ssr', async () => {
	async function run_test(dir) {
		if (dir[0] === '.') return;

		const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);

		const solo = config.solo || /\.solo/.test(dir);
		const it_fn = solo ? it.only : it;

		it_fn(dir, async () => {
			dir = path.resolve(`${__dirname}/samples`, dir);

			const compileOptions = {
				...config.compileOptions,
				generate: 'ssr'
			};

			const load = create_loader(compileOptions, dir);

			const Component = (await load(`${dir}/main.svelte`)).default;

			const expectedHtml = try_read_file(`${dir}/_expected.html`);
			const expectedCss = try_read_file(`${dir}/_expected.css`) || '';

			const props = try_load_json(`${dir}/data.json`) || undefined;

			const rendered = Component.render(props);
			const { html, css, head } = rendered;

			fs.writeFileSync(`${dir}/_actual.html`, html);
			if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

			try {
				assert_html_equal_with_options(html, expectedHtml, {
					preserveComments: compileOptions.preserveComments,
					withoutNormalizeHtml: config.withoutNormalizeHtml
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
					assert_html_equal_with_options(
						head,
						fs.readFileSync(`${dir}/_expected-head.html`, 'utf-8'),
						{
							preserveComments: compileOptions.hydratable
						}
					);
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
