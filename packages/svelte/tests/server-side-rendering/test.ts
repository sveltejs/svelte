// @vitest-environment jsdom

// Yes it's an SSR test, but we need the env to compare html
// TODO: Isolate the html comparison
// TODO: happy-dom might be faster but currently replaces quotes which fails assertions

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { render } from 'svelte/server';
import { compile_directory, should_update_expected, try_read_file } from '../helpers.js';
import { assert_html_equal_with_options } from '../html_equal.js';
import { suite_with_variants, type BaseTest } from '../suite.js';
import type { CompileOptions } from '#compiler';
import { seen } from '../../src/internal/server/dev.js';

interface SSRTest extends BaseTest {
	mode?: ('sync' | 'async')[];
	compileOptions?: Partial<CompileOptions>;
	load_compiled?: boolean;
	props?: Record<string, any>;
	id_prefix?: string;
	withoutNormalizeHtml?: boolean;
	error?: string;
	csp?: { nonce: string } | { hash: true };
	script_hashes?: string[];
}

// TODO remove this shim when we can
// @ts-expect-error
Promise.withResolvers = () => {
	let resolve;
	let reject;

	const promise = new Promise((f, r) => {
		resolve = f;
		reject = r;
	});

	return { promise, resolve, reject };
};

const { test, run } = suite_with_variants<SSRTest, 'sync' | 'async', CompileOptions>(
	['sync', 'async'],
	(variant, config, test_name) => {
		if (config.mode && !config.mode.includes(variant)) {
			return 'no-test';
		}

		if (test_name.startsWith('async') && variant === 'sync') {
			return 'no-test';
		}

		return false;
	},
	async (config, test_dir) => {
		const compile_options = {
			experimental: {
				async: true,
				...config.compileOptions?.experimental
			},
			...config.compileOptions
		};

		if (!config.load_compiled) {
			await compile_directory(test_dir, 'server', compile_options);
		}

		return compile_options;
	},
	async (config, test_dir, variant, compile_options) => {
		const Component = (await import(`${test_dir}/_output/server/main.svelte.js`)).default;
		const expected_html = try_read_file(`${test_dir}/_expected.html`);
		const is_async = variant === 'async';

		seen?.clear();

		let rendered;
		let errored = false;
		try {
			const render_result = render(Component, {
				props: config.props || {},
				idPrefix: config.id_prefix,
				csp: config.csp
			});
			rendered = is_async ? await render_result : render_result;
		} catch (error) {
			errored = true;
			if (config.error) {
				assert.include((error as Error).message, config.error);
				return;
			} else {
				throw error;
			}
		}

		if (config.error && !errored) {
			assert.fail('Expected an error to be thrown, but rendering succeeded.');
		}

		const { body, head, hashes } = rendered;

		fs.writeFileSync(
			`${test_dir}/_output/${is_async ? 'async_rendered.html' : 'rendered.html'}`,
			body
		);

		if (head) {
			fs.writeFileSync(
				`${test_dir}/_output/${is_async ? 'async_rendered_head.html' : 'rendered_head.html'}`,
				head
			);
		}

		try {
			assert_html_equal_with_options(body, expected_html || '', {
				preserveComments: compile_options.preserveComments,
				withoutNormalizeHtml: config.withoutNormalizeHtml
			});
		} catch (error: any) {
			if (should_update_expected()) {
				fs.writeFileSync(`${test_dir}/_expected.html`, body);
				console.log(`Updated ${test_dir}/_expected.html.`);
			} else {
				error.message += '\n' + `${test_dir}/main.svelte`;
				throw error;
			}
		}

		if (fs.existsSync(`${test_dir}/_expected_head.html`)) {
			try {
				assert_html_equal_with_options(
					head,
					fs.readFileSync(`${test_dir}/_expected_head.html`, 'utf-8'),
					{}
				);
			} catch (error: any) {
				if (should_update_expected()) {
					fs.writeFileSync(`${test_dir}/_expected_head.html`, head);
					console.log(`Updated ${test_dir}/_expected_head.html.`);
					error.message += '\n' + `${test_dir}/main.svelte`;
				} else {
					throw error;
				}
			}
		}

		if (config.script_hashes !== undefined) {
			assert.deepEqual(hashes.script, config.script_hashes);
		}
	}
);

export { test };

await run(__dirname);
