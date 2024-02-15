// @vitest-environment jsdom

import * as fs from 'node:fs';
import { assert } from 'vitest';
import { compile_directory, should_update_expected } from '../helpers.js';
import { assert_html_equal } from '../html_equal.js';
import { suite, assert_ok } from '../suite.js';
import { createClassComponent } from 'svelte/legacy';
import type { CompileOptions } from '#compiler';

interface HydrationTest {
	solo?: boolean;
	skip?: boolean;
	load_compiled?: boolean;
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

	target.innerHTML = read_html(`${cwd}/_before.html`);

	let before_head;
	try {
		before_head = read_html(`${cwd}/_before_head.html`);
		head.innerHTML = before_head;
	} catch (err) {
		// continue regardless of error
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
			props: config.props
		});

		console.error = error;
		if (config.expect_hydration_error) {
			assert.ok(got_hydration_error, 'Expected hydration error');
		} else {
			assert.ok(!got_hydration_error, 'Unexpected hydration error');
		}

		try {
			assert_html_equal(target.innerHTML, read_html(`${cwd}/_after.html`, `${cwd}/_before.html`));
		} catch (error) {
			if (should_update_expected()) {
				fs.writeFileSync(`${cwd}/_after.html`, target.innerHTML);
				console.log(`Updated ${cwd}/_after.html.`);
			} else {
				throw error;
			}
		}

		if (before_head) {
			try {
				const after_head = read_html(`${cwd}/_after_head.html`, `${cwd}/_before_head.html`);
				assert_html_equal(head.innerHTML, after_head);
			} catch (error) {
				if (should_update_expected()) {
					fs.writeFileSync(`${cwd}/_after_head.html`, head.innerHTML);
					console.log(`Updated ${cwd}/_after_head.html.`);
				} else {
					throw error;
				}
			}
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
