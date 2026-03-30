import * as path from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { assert } from 'vitest';
import { compile_directory } from '../helpers.js';
import { suite_with_variants, type BaseTest } from '../suite.js';
import type { CompileOptions } from '#compiler';
import renderer, { create_root, serialize, dispatch_event } from './renderer.js';

export interface CustomRendererTest extends BaseTest {
	html?: string;
	compileOptions?: Partial<CompileOptions>;
	props?: Record<string, any>;
	error?: string;
	runtime_error?: string;
	warnings?: string[];
	test?: (args: {
		assert: typeof import('vitest').assert;
		target: any;
		component: Record<string, any>;
		mod: any;
		logs: any[];
		warnings: any[];
		renderer: typeof renderer;
		serialize: typeof serialize;
		dispatch_event: typeof dispatch_event;
	}) => void | Promise<void>;
}

// eslint-disable-next-line no-console
const console_log = console.log;
// eslint-disable-next-line no-console
const console_warn = console.warn;

const renderer_path = path.resolve(import.meta.dirname, 'renderer.js');

export function custom_renderer_suite() {
	return suite_with_variants<CustomRendererTest, 'custom-renderer', CompileOptions>(
		['custom-renderer'],
		(_variant, _config) => {
			return false;
		},
		(config, cwd) => {
			return common_setup(cwd, config);
		},
		async (config, cwd, _variant, common) => {
			await run_test(cwd, config, common);
		}
	);
}

async function common_setup(cwd: string, config: CustomRendererTest) {
	const compile_options: CompileOptions = {
		generate: 'client',
		rootDir: cwd,
		runes: true,
		customRenderer: renderer_path,
		...config.compileOptions
	};

	await compile_directory(cwd, 'client', compile_options);

	return compile_options;
}

async function run_test(cwd: string, config: CustomRendererTest, compile_options: CompileOptions) {
	let unintended_error = false;
	let logs: any[] = [];
	let warnings: any[] = [];

	{
		const str = config.test?.toString() ?? '';
		let n = 0;
		let i = 0;
		while (i < str.length) {
			if (str[i] === '(') n++;
			if (str[i] === ')' && --n === 0) break;
			i++;
		}

		if (str.slice(0, i).includes('logs')) {
			// eslint-disable-next-line no-console
			console.log = (...args) => {
				logs.push(...args);
			};
		}

		if (str.slice(0, i).includes('warnings') || config.warnings) {
			// eslint-disable-next-line no-console
			console.warn = (...args) => {
				if (typeof args[0] === 'string' && args[0].startsWith('%c[svelte]')) {
					let message = args[0];
					message = message.slice(message.indexOf('%c', 2) + 2);
					const lines = message.split('\n');
					if (lines.at(-1)?.startsWith('https://svelte.dev/e/')) {
						lines.pop();
					}
					message = lines.join('\n');
					warnings.push(message);
				} else {
					warnings.push(...args);
				}
			};
		}
	}

	try {
		const mod = await import(`${cwd}/_output/client/main.svelte.js`);
		const target = create_root();

		let unmount: (() => void) | undefined;

		try {
			unmount = renderer.render(mod.default, {
				target,
				props: config.props ?? {}
			});
		} catch (err) {
			if (config.error) {
				assert.include((err as Error).message, config.error);
				return;
			}
			throw err;
		}

		if (config.error) {
			unintended_error = true;
			assert.fail('Expected a runtime error');
		}

		if (config.html) {
			const html = serialize(target);
			assert.equal(html, config.html);
		}

		try {
			if (config.test) {
				await config.test({
					assert,
					target,
					component: config.props ?? {},
					mod,
					logs,
					warnings,
					renderer: renderer,
					serialize,
					dispatch_event
				});
			}

			if (config.runtime_error) {
				unintended_error = true;
				assert.fail('Expected a runtime error');
			}
		} finally {
			unmount?.();

			if (config.warnings) {
				assert.deepEqual(warnings, config.warnings);
			}

			// After unmount the target should be empty (only comments remain, which serialize to '')
			const remaining = serialize(target);
			assert.equal(remaining, '', 'Expected component to leave nothing behind after unmount');
		}
	} catch (err) {
		if (config.runtime_error) {
			assert.include((err as Error).message, config.runtime_error);
		} else if (config.error && !unintended_error) {
			assert.include((err as Error).message, config.error);
		} else {
			throw err;
		}
	} finally {
		await setImmediate();
		console.log = console_log;
		console.warn = console_warn;
	}
}

export function ok(value: any): asserts value {
	if (!value) {
		throw new Error(`Expected truthy value, got ${value}`);
	}
}
