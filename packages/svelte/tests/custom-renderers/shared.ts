import * as fs from 'node:fs';
import * as path from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { assert } from 'vitest';
import { compile_directory } from '../helpers.js';
import { suite_with_variants, type BaseTest } from '../suite.js';
import type { CompileOptions } from '#compiler';
import renderer, {
	create_root,
	serialize,
	serialize_dom_children,
	dispatch_event,
	connections
} from './renderer.js';
import { mount, unmount, hydrate } from '../../src/index-client.js';
import { render } from '../../src/server/index.js';
import { writeFile } from 'node:fs/promises';
import { globSync } from 'tinyglobby';

// `_config.js` test callbacks rely on inferred parameter types, which
// TypeScript treats as non-explicit and rejects for chai's assertion-function
// signatures (TS2775). Override the assertion methods we use with
// non-assertion equivalents; runtime behavior is unchanged.
type NonAssertingMethods = {
	ok(value: unknown, message?: string): void;
	isOk(value: unknown, message?: string): void;
	isTrue(value: unknown, message?: string): void;
	isFalse(value: unknown, message?: string): void;
	exists(value: unknown, message?: string): void;
	notExists(value: unknown, message?: string): void;
	instanceOf(value: unknown, type: Function, message?: string): void;
};

type Assert = Omit<typeof import('vitest').assert, keyof NonAssertingMethods> & NonAssertingMethods;

export interface CustomRendererTest extends BaseTest {
	html?: string;
	compileOptions?: Partial<CompileOptions>;
	/**
	 * Where to mount `main.svelte`. Defaults to a custom renderer root (mounted with
	 * `renderer`); `'dom'` mounts into a DOM element without specifying a renderer
	 */
	target?: 'dom';
	/** Server-render `main.svelte` and hydrate it into a DOM element (implies `target: 'dom'`) */
	hydrate?: true;
	props?: Record<string, any>;
	context?: Map<any, any>;
	error?: string;
	compile_error?: string;
	compile_warnings?: false;
	runtime_error?: string;
	warnings?: string[];
	test?: (args: {
		assert: Assert;
		target: any;
		component: Record<string, any>;
		mod: any;
		logs: any[];
		warnings: any[];
		renderer: typeof renderer;
		serialize: typeof serialize;
		serialize_dom: typeof serialize_dom_children;
		dispatch_event: typeof dispatch_event;
	}) => void | Promise<void>;
}

// eslint-disable-next-line no-console
const console_log = console.log;
// eslint-disable-next-line no-console
const console_warn = console.warn;

const renderer_path = path.resolve(import.meta.dirname, 'renderer.ts');

export function custom_renderer_suite() {
	return suite_with_variants<CustomRendererTest, 'custom-renderer', CompileOptions | null>(
		['custom-renderer'],
		(_variant, _config) => {
			return false;
		},
		(config, cwd) => {
			return common_setup(cwd, config);
		},
		async (config, cwd, _variant, common) => {
			if (common === null) {
				// compile_error was expected and matched — test passed
				return;
			}
			if (config.compile_error) {
				// compile_error was expected but common_setup didn't throw
				assert.fail('Expected a compile error');
			}
			await run_test(cwd, config, common);
		}
	);
}

async function common_setup(
	cwd: string,
	config: CustomRendererTest
): Promise<CompileOptions | null> {
	const compile_options: CompileOptions = {
		generate: 'client',
		rootDir: cwd,
		runes: true,
		...config.compileOptions,
		experimental: {
			...config.compileOptions?.experimental,
			customRenderer: renderer_path
		}
	};

	try {
		await compile_directory(cwd, 'client', compile_options);

		if (config.hydrate) {
			await compile_directory(cwd, 'server', compile_options);
		}
	} catch (err) {
		if (config.compile_error) {
			assert.include((err as Error).message, config.compile_error);
			return null;
		}
		throw err;
	}

	if (config.compile_warnings === false) {
		const output_dir = `${cwd}/_output/client`;
		const warning_files = globSync('**/*.warnings.json', { cwd: output_dir });

		for (const file of warning_files) {
			const warnings = JSON.parse(fs.readFileSync(path.join(output_dir, file), 'utf-8'));
			assert.deepEqual(
				warnings,
				[],
				`Expected no compile warnings in ${file}, got: ${warnings.map((/** @type {any} */ w: any) => w.code).join(', ')}`
			);
		}
	}

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
		const is_dom = config.target === 'dom' || config.hydrate === true;
		const target: any = is_dom ? document.createElement('main') : create_root();
		const serialize_target = () => (is_dom ? serialize_dom_children(target) : serialize(target));

		connections.open = 0;

		let component: Record<string, any> | undefined;
		try {
			if (config.hydrate) {
				const server = await import(`${cwd}/_output/server/main.svelte.js`);
				target.innerHTML = (await render(server.default, { props: config.props ?? {} })).body;

				component = hydrate(mod.default, {
					target,
					props: config.props ?? {},
					context: config.context
				});
			} else if (is_dom) {
				component = mount(mod.default, {
					target,
					props: config.props ?? {},
					context: config.context
				});
			} else {
				component = mount(mod.default, {
					renderer,
					target,
					props: config.props ?? {},
					context: config.context
				});
			}
		} catch (err) {
			if (config.error) {
				assert.include((err as Error).message, config.error);
				return;
			}
			throw err;
		}

		writeFile(
			path.join(cwd, '_output/client/output.json'),
			JSON.stringify(
				is_dom ? serialize_target() : target,
				(key, value) => {
					if (key === 'parent') return undefined;
					return value;
				},
				'\t'
			)
		);

		if (config.error) {
			unintended_error = true;
			assert.fail('Expected a runtime error');
		}

		if (config.html) {
			assert.equal(serialize_target(), config.html);
		}

		try {
			if (config.test) {
				await config.test({
					assert,
					target,
					component: component ?? {},
					mod,
					logs,
					warnings,
					renderer: renderer,
					serialize,
					serialize_dom: serialize_dom_children,
					dispatch_event
				});
			}

			if (config.runtime_error) {
				unintended_error = true;
				assert.fail('Expected a runtime error');
			}
		} finally {
			if (component) {
				await unmount(component);
			}

			if (config.warnings) {
				assert.deepEqual(warnings, config.warnings);
			}

			// After unmount the target should be empty (only comments remain, which serialize to '')
			const remaining = serialize_target();
			assert.equal(remaining, '', 'Expected component to leave nothing behind after unmount');
			assert.equal(connections.open, 0, 'Expected every renderer connection to be destroyed');
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
