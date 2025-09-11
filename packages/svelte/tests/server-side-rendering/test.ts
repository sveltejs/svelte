// @vitest-environment jsdom

// Yes it's an SSR test, but we need the env to compare html
// TODO: Isolate the html comparison
// TODO: happy-dom might be faster but currently replaces quotes which fails assertions

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { render, renderAsync } from 'svelte/server';
import {
	async_mode,
	compile_directory,
	should_update_expected,
	try_read_file
} from '../helpers.js';
import { assert_html_equal_with_options } from '../html_equal.js';
import { suite, type BaseTest } from '../suite.js';
import type { CompileOptions } from '#compiler';

interface SSRTest extends BaseTest {
	compileOptions?: Partial<CompileOptions>;
	load_compiled?: boolean;
	props?: Record<string, any>;
	id_prefix?: string;
	withoutNormalizeHtml?: boolean;
	errors?: string[];
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

// eslint-disable-next-line no-console
let console_error = console.error;

const { test, run } = suite<SSRTest>(async (config, test_dir) => {
	const compile_options = {
		experimental: {
			async: async_mode,
			...config.compileOptions?.experimental
		},
		...config.compileOptions
	};

	if (!config.load_compiled) {
		await compile_directory(test_dir, 'server', compile_options);
	}

	const errors: string[] = [];

	console.error = (...args) => {
		errors.push(...args);
	};

	const Component = (await import(`${test_dir}/_output/server/main.svelte.js`)).default;
	const expected_html = try_read_file(`${test_dir}/_expected.html`);
	const rendered = async_mode
		? await renderAsync(Component, {
				props: config.props || {},
				idPrefix: config.id_prefix
			})
		: render(Component, {
				props: config.props || {},
				idPrefix: config.id_prefix
			});
	const { body, head } = rendered;

	fs.writeFileSync(`${test_dir}/_output/rendered.html`, body);

	if (head) {
		fs.writeFileSync(`${test_dir}/_output/rendered_head.html`, head);
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

	if (errors.length > 0) {
		assert.deepEqual(config.errors, errors);
	}

	console.error = console_error;
});

export { test };

await run(__dirname);
