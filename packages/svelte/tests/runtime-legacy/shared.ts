import * as fs from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import { globSync } from 'tinyglobby';
import { createClassComponent } from 'svelte/legacy';
import { proxy } from 'svelte/internal/client';
import { flushSync, hydrate, mount, unmount } from 'svelte';
import { render } from 'svelte/server';
import { afterAll, assert, beforeAll, beforeEach } from 'vitest';
import { async_mode, compile_directory, fragments } from '../helpers.js';
import { assert_html_equal, assert_html_equal_with_options } from '../html_equal.js';
import { raf } from '../animation-helpers.js';
import type { CompileOptions } from '#compiler';
import { suite_with_variants, type BaseTest } from '../suite.js';
import { clear } from '../../src/internal/client/reactivity/batch.js';
import { hydrating } from '../../src/internal/client/dom/hydration.js';

type Assert = typeof import('vitest').assert & {
	htmlEqual(a: string, b: string, description?: string): void;
	htmlEqualWithOptions(
		a: string,
		b: string,
		opts: {
			preserveComments: boolean;
			withoutNormalizeHtml: boolean;
		},
		description?: string
	): void;
};

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

export interface RuntimeTest<Props extends Record<string, any> = Record<string, any>>
	extends BaseTest {
	/** Use e.g. `mode: ['client']` to indicate that this test should never run in server/hydrate modes */
	mode?: Array<'server' | 'async-server' | 'client' | 'hydrate'>;
	/** Temporarily skip specific modes, without skipping the entire test */
	skip_mode?: Array<'server' | 'async-server' | 'client' | 'hydrate'>;
	/** Skip if running with process.env.NO_ASYNC */
	skip_no_async?: boolean;
	/** Skip if running without process.env.NO_ASYNC */
	skip_async?: boolean;
	html?: string;
	ssrHtml?: string;
	compileOptions?: Partial<CompileOptions>;
	props?: Props;
	server_props?: Props;
	id_prefix?: string;
	before_test?: () => void;
	after_test?: () => void;
	test?: (args: {
		variant: 'dom' | 'hydrate';
		assert: Assert;
		compileOptions: CompileOptions;
		component: Props & {
			[key: string]: any;
		};
		instance: Record<string, any>;
		mod: any;
		ok: typeof ok;
		raf: {
			tick: (ms: number) => void;
		};
		target: HTMLElement;
		window: Window & {
			Event: typeof Event;
			InputEvent: typeof InputEvent;
			KeyboardEvent: typeof KeyboardEvent;
			MouseEvent: typeof MouseEvent;
		};
		logs: any[];
		warnings: any[];
		errors: any[];
		hydrate: Function;
	}) => void | Promise<void>;
	test_ssr?: (args: {
		logs: any[];
		warnings: any[];
		assert: Assert;
		variant: 'ssr' | 'async-ssr';
	}) => void | Promise<void>;
	accessors?: boolean;
	immutable?: boolean;
	intro?: boolean;
	load_compiled?: boolean;
	error?: string;
	runtime_error?: string;
	warnings?: string[];
	errors?: string[];
	expect_unhandled_rejections?: boolean;
	withoutNormalizeHtml?: boolean | 'only-strip-comments';
	recover?: boolean;
}

declare global {
	var __svelte:
		| {
				h?: Map<string, unknown>;
		  }
		| undefined;
}

let unhandled_rejection: Error | null = null;

function unhandled_rejection_handler(err: Error) {
	unhandled_rejection = err;
}

const listeners = process.rawListeners('unhandledRejection');

beforeAll(() => {
	// @ts-expect-error TODO huh?
	process.prependListener('unhandledRejection', unhandled_rejection_handler);
});

beforeEach(() => {
	delete globalThis?.__svelte?.h;
});

afterAll(() => {
	process.removeListener('unhandledRejection', unhandled_rejection_handler);
});

// eslint-disable-next-line no-console
let console_log = console.log;

// eslint-disable-next-line no-console
let console_warn = console.warn;

// eslint-disable-next-line no-console
let console_error = console.error;

export function runtime_suite(runes: boolean) {
	return suite_with_variants<RuntimeTest, 'hydrate' | 'ssr' | 'async-ssr' | 'dom', CompileOptions>(
		['dom', 'hydrate', 'ssr', 'async-ssr'],
		(variant, config, test_name) => {
			if (!async_mode && (config.skip_no_async || test_name.startsWith('async-'))) {
				return true;
			}

			if (async_mode && config.skip_async) {
				return true;
			}

			if (variant === 'hydrate') {
				if (config.mode && !config.mode.includes('hydrate')) return 'no-test';
				if (config.skip_mode?.includes('hydrate')) return true;
			}

			if (
				variant === 'dom' &&
				(config.skip_mode?.includes('client') || (config.mode && !config.mode.includes('client')))
			) {
				return 'no-test';
			}

			if (variant === 'ssr') {
				if (
					(config.mode && !config.mode.includes('server')) ||
					(!config.test_ssr &&
						config.html === undefined &&
						config.ssrHtml === undefined &&
						config.error === undefined &&
						config.runtime_error === undefined &&
						!config.mode?.includes('server'))
				) {
					return 'no-test';
				}
				if (config.skip_mode?.includes('server')) return true;
			}

			if (variant === 'async-ssr') {
				if (!runes || !async_mode) return 'no-test';
				if (
					(config.mode && !config.mode.includes('async-server')) ||
					(!config.test_ssr &&
						config.html === undefined &&
						config.ssrHtml === undefined &&
						config.error === undefined &&
						config.runtime_error === undefined &&
						!config.mode?.includes('async-server'))
				) {
					return 'no-test';
				}
				if (config.skip_mode?.includes('async-server')) return true;
			}

			return false;
		},
		(config, cwd) => {
			return common_setup(cwd, runes, config);
		},
		async (config, cwd, variant, common) => {
			await run_test_variant(cwd, config, variant, common, runes);
		}
	);
}

async function common_setup(cwd: string, runes: boolean | undefined, config: RuntimeTest) {
	const force_hmr = process.env.HMR && config.compileOptions?.dev !== false && !config.error;

	const compileOptions: CompileOptions = {
		generate: 'client',
		rootDir: cwd,
		dev: force_hmr ? true : undefined,
		hmr: force_hmr ? true : undefined,
		experimental: {
			async: runes && async_mode
		},
		fragments,
		...config.compileOptions,
		immutable: config.immutable,
		accessors: 'accessors' in config ? config.accessors : true,
		runes:
			config.compileOptions && 'runes' in config.compileOptions
				? config.compileOptions.runes
				: runes
	};

	// load_compiled can be used for debugging a test. It means the compiler will not run on the input
	// so you can manipulate the output manually to see what fixes it, adding console.logs etc.
	if (!config.load_compiled) {
		await compile_directory(cwd, 'client', compileOptions);
		await compile_directory(cwd, 'server', compileOptions);
	}

	return compileOptions;
}

async function run_test_variant(
	cwd: string,
	config: RuntimeTest,
	variant: 'dom' | 'hydrate' | 'ssr' | 'async-ssr',
	compileOptions: CompileOptions,
	runes: boolean
) {
	let unintended_error = false;

	let logs: string[] = [];
	let warnings: string[] = [];
	let errors: string[] = [];
	let manual_hydrate = false;

	{
		// use some crude static analysis to determine if logs/warnings are intercepted.
		// we do this instead of using getters on the `test` parameters so that we can
		// squelch logs in SSR tests while printing temporary logs in other cases
		let str = config.test?.toString() ?? '';
		let n = 0;
		let i = 0;
		while (i < str.length) {
			if (str[i] === '(') n++;
			if (str[i] === ')' && --n === 0) break;
			i++;
		}

		let ssr_str = config.test_ssr?.toString() ?? '';
		let sn = 0;
		let si = 0;
		while (si < ssr_str.length) {
			if (ssr_str[si] === '(') sn++;
			if (ssr_str[si] === ')' && --sn === 0) break;
			si++;
		}

		if (str.slice(0, i).includes('logs') || ssr_str.slice(0, si).includes('logs')) {
			// eslint-disable-next-line no-console
			console.log = (...args) => {
				logs.push(...args);
			};
		}

		if (str.slice(0, i).includes('hydrate')) {
			manual_hydrate = true;
		}

		if (
			str.slice(0, i).includes('warnings') ||
			config.warnings ||
			ssr_str.slice(0, si).includes('warnings')
		) {
			// eslint-disable-next-line no-console
			console.warn = (...args) => {
				if (typeof args[0] === 'string' && args[0].startsWith('%c[svelte]')) {
					// TODO convert this to structured data, for more robust comparison?

					let message = args[0];
					message = message.slice(message.indexOf('%c', 2) + 2);

					// Remove the "https://svelte.dev/e/..." link at the end
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

		if (str.slice(0, i).includes('errors') || config.errors) {
			// eslint-disable-next-line no-console
			console.error = (...args) => {
				errors.push(...args);
			};
		}
	}

	try {
		unhandled_rejection = null;

		if (config.expect_unhandled_rejections) {
			listeners.forEach((listener) => {
				// @ts-expect-error
				process.removeListener('unhandledRejection', listener);
			});
		}

		// hack to support transition tests
		raf.reset();

		// Put things we need on window for testing
		const styles = globSync('**/*.css', { cwd: `${cwd}/_output/client` })
			.map((file) => fs.readFileSync(`${cwd}/_output/client/${file}`, 'utf-8'))
			.join('\n')
			.replace(/\/\*<\/?style>\*\//g, '');

		window.location.href = '';
		window.document.title = '';
		window.document.head.innerHTML = styles ? `<style>${styles}</style>` : '';
		window.document.body.innerHTML = '<main></main>';

		window.addEventListener('error', (e) => {
			unhandled_rejection = e.error;
			e.preventDefault();
		});

		globalThis.requestAnimationFrame = globalThis.setTimeout;

		let mod = await import(`${cwd}/_output/client/main.svelte.js`);

		const target = window.document.querySelector('main') as HTMLElement;

		let snapshot = undefined;

		if (variant === 'hydrate' || variant === 'ssr' || variant === 'async-ssr') {
			config.before_test?.();
			// ssr into target
			const SsrSvelteComponent = (await import(`${cwd}/_output/server/main.svelte.js`)).default;
			const render_result = render(SsrSvelteComponent, {
				props: config.server_props ?? config.props ?? {},
				idPrefix: config.id_prefix
			});
			const rendered =
				variant === 'async-ssr' || (variant === 'hydrate' && compileOptions.experimental?.async)
					? await render_result
					: render_result;
			const { body, head } = rendered;

			const prefix = variant === 'async-ssr' ? 'async_' : '';
			fs.writeFileSync(`${cwd}/_output/${prefix}rendered.html`, body);
			target.innerHTML = body;

			if (head) {
				fs.writeFileSync(`${cwd}/_output/${prefix}rendered_head.html`, head);
				window.document.head.innerHTML = window.document.head.innerHTML + head;
			}

			if (variant === 'hydrate') {
				// @ts-expect-error TODO
				if (config.snapshot) {
					// @ts-expect-error
					snapshot = config.snapshot(target);
				}
			}
		} else {
			target.innerHTML = '';
		}

		if (variant === 'ssr' || variant === 'async-ssr') {
			if (config.ssrHtml) {
				assert_html_equal_with_options(target.innerHTML, config.ssrHtml, {
					preserveComments:
						config.withoutNormalizeHtml === 'only-strip-comments' ? false : undefined,
					withoutNormalizeHtml: !!config.withoutNormalizeHtml
				});
			} else if (config.html) {
				assert_html_equal_with_options(target.innerHTML, config.html, {
					preserveComments:
						config.withoutNormalizeHtml === 'only-strip-comments' ? false : undefined,
					withoutNormalizeHtml: !!config.withoutNormalizeHtml
				});
			}

			if (config.test_ssr) {
				await config.test_ssr({
					logs,
					warnings,
					// @ts-expect-error
					assert: {
						...assert,
						htmlEqual: assert_html_equal,
						htmlEqualWithOptions: assert_html_equal_with_options
					},
					variant
				});
			}
		} else {
			logs.length = warnings.length = 0;

			config.before_test?.();

			let instance: any;
			let props: any;
			let hydrate_fn: Function = () => {
				throw new Error('Ensure dom mode is skipped');
			};

			const run_hydratables_init = () => {
				if (variant !== 'hydrate') return;
				const script = [...document.head.querySelectorAll('script').values()].find((script) =>
					script.textContent?.includes('window.__svelte ??= {}')
				)?.textContent;
				if (!script) return;
				(0, eval)(script);
			};

			if (runes) {
				props = proxy({ ...(config.props || {}) });

				// @ts-expect-error
				globalThis.__svelte.uid = 1;

				if (manual_hydrate && variant === 'hydrate') {
					hydrate_fn = () => {
						run_hydratables_init();
						instance = hydrate(mod.default, {
							target,
							props,
							intro: config.intro,
							recover: config.recover ?? false
						});
					};
				} else {
					run_hydratables_init();
					const render = variant === 'hydrate' ? hydrate : mount;
					instance = render(mod.default, {
						target,
						props,
						intro: config.intro,
						recover: config.recover ?? false
					});
				}
			} else {
				run_hydratables_init();
				instance = createClassComponent({
					component: mod.default,
					props: config.props,
					target,
					intro: config.intro,
					recover: config.recover ?? false,
					hydrate: variant === 'hydrate'
				});
			}

			if (config.error) {
				unintended_error = true;
				assert.fail('Expected a runtime error');
			}

			if (config.html) {
				flushSync();
				assert_html_equal_with_options(target.innerHTML, config.html, {
					preserveComments:
						config.withoutNormalizeHtml === 'only-strip-comments' ? false : undefined,
					withoutNormalizeHtml: !!config.withoutNormalizeHtml
				});
			}

			try {
				if (config.test) {
					flushSync();

					if (variant === 'hydrate' && cwd.includes('async-')) {
						// wait for pending boundaries to render
						await Promise.resolve();
					}

					await config.test({
						// @ts-expect-error TS doesn't get it
						assert: {
							...assert,
							htmlEqual: assert_html_equal,
							htmlEqualWithOptions: assert_html_equal_with_options
						},
						variant,
						component: runes ? props : instance,
						instance,
						mod,
						target,
						snapshot,
						window,
						raf,
						compileOptions,
						logs,
						warnings,
						errors,
						hydrate: hydrate_fn
					});
				}

				if (config.runtime_error && !unhandled_rejection) {
					unintended_error = true;
					assert.fail('Expected a runtime error');
				}
			} finally {
				if (runes) {
					unmount(instance);
				} else {
					instance.$destroy();
				}

				if (config.warnings) {
					assert.deepEqual(warnings, config.warnings);
				} else if (warnings.length && console.warn === console_warn) {
					unintended_error = true;
					console_warn.apply(console, warnings);
					assert.fail('Received unexpected warnings');
				}

				if (config.errors) {
					assert.deepEqual(errors, config.errors);
				} else if (errors.length && console.error === console_error) {
					unintended_error = true;
					console_error.apply(console, errors);
					assert.fail('Received unexpected errors');
				}

				assert_html_equal(
					target.innerHTML,
					'',
					'Expected component to unmount and leave nothing behind after it was destroyed'
				);

				// uncaught errors like during template effects flush
				if (unhandled_rejection) {
					if (!config.expect_unhandled_rejections) {
						throw unhandled_rejection; // eslint-disable-line no-unsafe-finally
					}
				}
			}
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
		if (hydrating) {
			throw new Error('Hydration state was not cleared');
		}

		config.after_test?.();

		// Free up the microtask queue
		// 1. Vitest's test runner which uses setInterval can log progress
		// 2. Any expected unhandled rejections are ran before we reattach the listeners
		await setImmediate();

		if (config.expect_unhandled_rejections) {
			listeners.forEach((listener) => {
				// @ts-expect-error
				process.on('unhandledRejection', listener);
			});
		}

		console.log = console_log;
		console.warn = console_warn;
		console.error = console_error;

		clear();
	}
}

export function ok(value: any): asserts value {
	if (!value) {
		throw new Error(`Expected truthy value, got ${value}`);
	}
}
