// @vitest-environment jsdom

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { compile_directory, should_update_expected } from '../helpers.js';
import { assert_html_equal } from '../html_equal.js';
import { suite, assert_ok, type BaseTest } from '../suite.js';
import { createClassComponent } from 'svelte/legacy';
import { render } from 'svelte/server';
import type { CompileOptions } from '#compiler';

interface HydrationTest extends BaseTest {
	load_compiled?: boolean;
	server_props?: Record<string, any>;
	props?: Record<string, any>;
	compileOptions?: Partial<CompileOptions>;
	/**
	 * By default, whitespace between ssr comments is removed so the output looks a bit more readable.
	 * Some tests rely on the whitespace being there, so set this to false to disable the removal.
	 */
	trim_whitespace?: false;
	expect_hydration_error?: true;
	snapshot?: (target: HTMLElement) => any;
	test?: (
		assert: typeof import('vitest').assert & {
			htmlEqual(a: string, b: string, description?: string): void;
		},
		target: HTMLElement,
		snapshot: any,
		component: any,
		window: any
	) => void | Promise<void>;
	before_test?: () => void;
	after_test?: () => void;
}

const { test, run } = suite<HydrationTest>(async (config, cwd) => {
	/**
	 * Read file and remove whitespace between ssr comments
	 */
	function read_html(path: string, fallback?: string): string {
		const html = fs.readFileSync(fallback && !fs.existsSync(path) ? fallback : path, 'utf-8');
		return config.trim_whitespace !== false
			? html.replace(/(<!--ssr:.?-->)[ \t\n\r\f]+(<!--ssr:.?-->)/g, '$1$2')
			: html;
	}

	if (!config.load_compiled) {
		await compile_directory(cwd, 'client', { accessors: true, ...config.compileOptions });
		await compile_directory(cwd, 'server', config.compileOptions);
	}

	const target = window.document.body;
	const head = window.document.head;

	const rendered = render((await import(`${cwd}/_output/server/main.svelte.js`)).default, {
		props: config.server_props ?? config.props ?? {}
	});

	fs.writeFileSync(`${cwd}/_output/body.html`, rendered.html + '\n');
	target.innerHTML = rendered.html;

	if (rendered.head) {
		fs.writeFileSync(`${cwd}/_output/head.html`, rendered.head + '\n');
		head.innerHTML = rendered.head;
	}

	config.before_test?.();

	try {
		const snapshot = config.snapshot ? config.snapshot(target) : {};

		const error = console.error;
		let got_hydration_error = false;
		console.error = (message: any) => {
			if (typeof message === 'string' && message.startsWith('ERR_SVELTE_HYDRATION_MISMATCH')) {
				got_hydration_error = true;
				if (!config.expect_hydration_error) {
					error(message);
				}
			} else {
				error(message);
			}
		};

		const component = createClassComponent({
			component: (await import(`${cwd}/_output/client/main.svelte.js`)).default,
			target,
			hydrate: true,
			props: config.props
		});

		console.error = error;
		if (config.expect_hydration_error) {
			assert.ok(got_hydration_error, 'Expected hydration error');
		} else {
			assert.ok(!got_hydration_error, 'Unexpected hydration error');
		}

		const expected = fs.existsSync(`${cwd}/_expected.html`)
			? read_html(`${cwd}/_expected.html`)
			: rendered.html;
		assert_html_equal(target.innerHTML, expected);

		if (rendered.head) {
			const expected = fs.existsSync(`${cwd}/_expected_head.html`)
				? read_html(`${cwd}/_expected_head.html`)
				: rendered.head;
			assert_html_equal(head.innerHTML, expected);
		}

		if (config.snapshot) {
			const snapshot_after = config.snapshot(target);
			for (const s in snapshot_after) {
				assert.ok(
					// Error logger borks because of circular references so use this instead
					snapshot_after[s] === snapshot[s],
					`Expected snapshot key "${s}" to have same value/reference`
				);
			}
		}

		if (config.test) {
			await config.test(
				// @ts-expect-error TS doesn't get it
				{
					...assert,
					htmlEqual: assert_html_equal
				},
				target,
				snapshot,
				component,
				window
			);
		}

		component.$destroy();
		// use the assert_html_equal function because there will be <!--ssr:X--> comments left
		assert_html_equal(target.innerHTML, '');
	} finally {
		config.after_test?.();
	}
});
export { test, assert_ok };

await run(__dirname);
