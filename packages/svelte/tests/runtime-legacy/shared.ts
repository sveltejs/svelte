import * as fs from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import glob from 'tiny-glob/sync.js';
// import { clear_loops, flush, set_now, set_raf } from 'svelte/internal';
import * as $ from 'svelte/internal';
import { createClassComponent } from 'svelte/legacy';
import { render } from 'svelte/server';
import { afterAll, assert, beforeAll } from 'vitest';
import { compile_directory } from '../helpers.js';
import { setup_html_equal } from '../html_equal.js';
import { raf } from '../animation-helpers.js';
import type { CompileOptions } from '#compiler';
import { suite_with_variants, type BaseTest } from '../suite.js';

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

export interface RuntimeTest<Props extends Record<string, any> = Record<string, any>>
	extends BaseTest {
	/** Use `true` to signal a temporary skip, and `"permanent"` to signal that this test is never intended to run in ssr mode */
	skip_if_ssr?: boolean | 'permanent';
	/** Use `true` to signal a temporary skip, and `"permanent"` to signal that this test is never intended to run in hydration mode */
	skip_if_hydrate?: boolean | 'permanent';
	html?: string;
	ssrHtml?: string;
	compileOptions?: Partial<CompileOptions>;
	props?: Props;
	before_test?: () => void;
	after_test?: () => void;
	test?: (args: {
		variant: 'dom' | 'hydrate';
		assert: Assert;
		compileOptions: CompileOptions;
		component: Props & {
			[key: string]: any;
		};
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
	}) => void | Promise<void>;
	test_ssr?: (args: { assert: Assert }) => void | Promise<void>;
	accessors?: boolean;
	immutable?: boolean;
	intro?: boolean;
	load_compiled?: boolean;
	error?: string;
	runtime_error?: string;
	warnings?: string[];
	expect_unhandled_rejections?: boolean;
	withoutNormalizeHtml?: boolean;
}

let unhandled_rejection: Error | null = null;

function unhandled_rejection_handler(err: Error) {
	unhandled_rejection = err;
}

const listeners = process.rawListeners('unhandledRejection');

const { assert_html_equal, assert_html_equal_with_options } = setup_html_equal({
	removeDataSvelte: true
});

beforeAll(() => {
	// @ts-expect-error TODO huh?
	process.prependListener('unhandledRejection', unhandled_rejection_handler);
});

afterAll(() => {
	process.removeListener('unhandledRejection', unhandled_rejection_handler);
});

export function runtime_suite(runes: boolean) {
	return suite_with_variants<RuntimeTest, 'hydrate' | 'ssr' | 'dom', CompileOptions>(
		['dom', 'hydrate', 'ssr'],
		(variant, config) => {
			if (variant === 'hydrate') {
				if (config.skip_if_hydrate === 'permanent') return 'no-test';
				if (config.skip_if_hydrate) return true;
			}
			if (variant === 'ssr') {
				if (
					config.skip_if_ssr === 'permanent' ||
					(!config.test_ssr &&
						config.html === undefined &&
						config.ssrHtml === undefined &&
						config.error === undefined)
				) {
					return 'no-test';
				}
				if (config.skip_if_ssr) return true;
			}

			return false;
		},
		(config, cwd) => {
			return common_setup(cwd, runes, config);
		},
		async (config, cwd, variant, common) => {
			await run_test_variant(cwd, config, variant, common);
		}
	);
}

function common_setup(cwd: string, runes: boolean | undefined, config: RuntimeTest) {
	const compileOptions: CompileOptions = {
		generate: 'client',
		...config.compileOptions,
		immutable: config.immutable,
		accessors: 'accessors' in config ? config.accessors : true,
		runes
	};

	// load_compiled can be used for debugging a test. It means the compiler will not run on the input
	// so you can manipulate the output manually to see what fixes it, adding console.logs etc.
	if (!config.load_compiled) {
		compile_directory(cwd, 'client', compileOptions);
		compile_directory(cwd, 'server', compileOptions);
	}

	return compileOptions;
}

async function run_test_variant(
	cwd: string,
	config: RuntimeTest,
	variant: 'dom' | 'hydrate' | 'ssr',
	compileOptions: CompileOptions
) {
	let unintended_error = false;

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
		const styles = glob('**/*.css', { cwd: `${cwd}/_output/client` })
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

		let mod = await import(`${cwd}/_output/client/main.svelte.js`);

		const target = window.document.querySelector('main') as HTMLElement;

		let snapshot = undefined;

		if (variant === 'hydrate' || variant === 'ssr') {
			config.before_test?.();
			// ssr into target
			const SsrSvelteComponent = (await import(`${cwd}/_output/server/main.svelte.js`)).default;
			const { html, head } = render(SsrSvelteComponent, { props: config.props || {} });

			fs.writeFileSync(`${cwd}/_output/rendered.html`, html);
			target.innerHTML = html;

			if (head) {
				fs.writeFileSync(`${cwd}/_output/rendered_head.html`, head);
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

		if (variant === 'ssr') {
			if (config.ssrHtml) {
				assert_html_equal_with_options(target.innerHTML, config.ssrHtml, {
					preserveComments: config.compileOptions?.preserveComments,
					withoutNormalizeHtml: config.withoutNormalizeHtml
				});
			} else if (config.html) {
				assert_html_equal_with_options(target.innerHTML, config.html, {
					preserveComments: config.compileOptions?.preserveComments,
					withoutNormalizeHtml: config.withoutNormalizeHtml
				});
			}

			if (config.test_ssr) {
				await config.test_ssr({
					// @ts-expect-error
					assert: {
						...assert,
						htmlEqual: assert_html_equal,
						htmlEqualWithOptions: assert_html_equal_with_options
					}
				});
			}
		} else {
			config.before_test?.();

			const warnings: string[] = [];
			// eslint-disable-next-line no-console
			const warn = console.warn;
			// eslint-disable-next-line no-console
			console.warn = (warning) => {
				warnings.push(warning);
			};

			// eslint-disable-next-line no-console
			const error = console.error;
			// eslint-disable-next-line no-console
			console.error = (error) => {
				if (typeof error === 'string' && error.startsWith('Hydration failed')) {
					throw new Error(error);
				}
			};

			const instance = createClassComponent({
				component: mod.default,
				props: config.props,
				target,
				immutable: config.immutable,
				intro: config.intro,
				recover: false
			});

			// eslint-disable-next-line no-console
			console.warn = warn;
			// eslint-disable-next-line no-console
			console.error = error;

			if (config.error) {
				unintended_error = true;
				assert.fail('Expected a runtime error');
			}

			if (config.warnings) {
				assert.deepEqual(warnings, config.warnings);
			} else if (warnings.length) {
				unintended_error = true;
				assert.fail('Received unexpected warnings');
			}

			if (config.html) {
				$.flushSync();
				assert_html_equal_with_options(target.innerHTML, config.html, {
					withoutNormalizeHtml: config.withoutNormalizeHtml
				});
			}

			try {
				if (config.test) {
					$.flushSync();
					await config.test({
						// @ts-expect-error TS doesn't get it
						assert: {
							...assert,
							htmlEqual: assert_html_equal,
							htmlEqualWithOptions: assert_html_equal_with_options
						},
						variant,
						component: instance,
						mod,
						target,
						snapshot,
						window,
						raf,
						compileOptions
					});
				}

				if (config.runtime_error && !unhandled_rejection) {
					unintended_error = true;
					assert.fail('Expected a runtime error');
				}
			} finally {
				instance.$destroy();
				assert_html_equal(
					target.innerHTML,
					'',
					'Expected component to unmount and leave nothing behind after it was destroyed'
				);

				// TODO: This seems useless, unhandledRejection is only triggered on the next task
				// by which time the test has already finished and the next test resets it to null above
				if (unhandled_rejection) {
					throw unhandled_rejection; // eslint-disable-line no-unsafe-finally
				}
			}
		}
	} catch (err) {
		if (config.runtime_error) {
			assert.equal((err as Error).message, config.runtime_error);
		} else if (config.error && !unintended_error) {
			assert.equal((err as Error).message, config.error);
		} else {
			throw err;
		}
	} finally {
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
	}
}

export function ok(value: any): asserts value {
	if (!value) {
		throw new Error(`Expected truthy value, got ${value}`);
	}
}
