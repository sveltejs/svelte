// @vitest-environment jsdom

// Yes it's an SSR test, but we need the env to compare html
// TODO: Isolate the html comparison
// TODO: happy-dom might be faster but currently replaces quotes which fails assertions

import * as fs from 'node:fs';
import { render } from 'svelte/server';
import { compile_directory, should_update_expected, try_read_file } from '../helpers.js';
import { assert_html_equal_with_options } from '../html_equal.js';
import { suite, type BaseTest } from '../suite.js';
import type { CompileOptions } from '#compiler';

interface SSRTest extends BaseTest {
	compileOptions?: Partial<CompileOptions>;
	props?: Record<string, any>;
	withoutNormalizeHtml?: boolean;
}

const { test, run } = suite<SSRTest>(async (config, test_dir) => {
	await compile_directory(test_dir, 'server', config.compileOptions);

	const Component = (await import(`${test_dir}/_output/server/main.svelte.js`)).default;
	const expected_html = try_read_file(`${test_dir}/_expected.html`);
	const rendered = render(Component, { props: config.props || {} });
	const { html, head } = rendered;

	fs.writeFileSync(`${test_dir}/_actual.html`, html);

	try {
		assert_html_equal_with_options(html, expected_html || '', {
			preserveComments: config.compileOptions?.preserveComments,
			withoutNormalizeHtml: config.withoutNormalizeHtml
		});
	} catch (error: any) {
		if (should_update_expected()) {
			fs.writeFileSync(`${test_dir}/_expected.html`, html);
			console.log(`Updated ${test_dir}/_expected.html.`);
		} else {
			error.message += '\n' + `${test_dir}/main.svelte`;
			throw error;
		}
	}

	if (fs.existsSync(`${test_dir}/_expected-head.html`)) {
		fs.writeFileSync(`${test_dir}/_actual-head.html`, head);

		try {
			assert_html_equal_with_options(
				head,
				fs.readFileSync(`${test_dir}/_expected-head.html`, 'utf-8'),
				{}
			);
		} catch (error: any) {
			if (should_update_expected()) {
				fs.writeFileSync(`${test_dir}/_expected-head.html`, head);
				console.log(`Updated ${test_dir}/_expected-head.html.`);
				error.message += '\n' + `${test_dir}/main.svelte`;
			} else {
				throw error;
			}
		}
	}
});

export { test };

await run(__dirname);
