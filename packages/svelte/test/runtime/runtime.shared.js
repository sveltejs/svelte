import * as fs from 'node:fs';
import * as path from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { compile } from 'svelte/compiler';
import { clear_loops, flush, set_now, set_raf } from 'svelte/internal';
import glob from 'tiny-glob/sync.js';
import { afterAll, assert, beforeAll, describe, it } from 'vitest';
import { create_loader, mkdirp, try_load_config } from '../helpers.js';
import { setup_html_equal } from '../html_equal.js';

let unhandled_rejection = false;
function unhandled_rejection_handler(err) {
	unhandled_rejection = err;
}

const listeners = process.rawListeners('unhandledRejection');

const { assert_html_equal, assert_html_equal_with_options } = setup_html_equal({
	removeDataSvelte: true
});

beforeAll(() => {
	process.prependListener('unhandledRejection', unhandled_rejection_handler);
});

afterAll(() => {
	process.removeListener('unhandledRejection', unhandled_rejection_handler);
});

const failed = new Set();

async function run_test(dir) {
	if (dir[0] === '.') return;

	const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);
	const solo = config.solo || /\.solo/.test(dir);

	const it_fn = config.skip ? it.skip : solo ? it.only : it;

	it_fn.each`
			hydrate  | from_ssr_html
			${false} | ${false}
			${true}  | ${false}
			${true}  | ${true}
		`(`${dir} hydrate: $hydrate, from_ssr: $from_ssr_html`, async ({ hydrate, from_ssr_html }) => {
		if (hydrate && config.skip_if_hydrate) return;
		if (hydrate && from_ssr_html && config.skip_if_hydrate_from_ssr) return;

		if (failed.has(dir)) {
			// this makes debugging easier, by only printing compiled output once
			assert.fail(`skipping ${dir}, already failed`);
		}

		unhandled_rejection = null;

		const cwd = path.resolve(`${__dirname}/samples/${dir}`);

		const compile_options = Object.assign({}, config.compileOptions || {}, {
			hydratable: hydrate,
			immutable: config.immutable,
			accessors: 'accessors' in config ? config.accessors : true
		});

		const load = create_loader(compile_options, cwd);

		let mod;
		let SvelteComponent;

		let unintended_error = null;

		if (config.expect_unhandled_rejections) {
			listeners.forEach((listener) => {
				// @ts-expect-error
				process.removeListener('unhandledRejection', listener);
			});
		}

		async function test() {
			// hack to support transition tests
			clear_loops();

			const raf = {
				time: 0,
				callback: null,
				tick: (now) => {
					raf.time = now;
					if (raf.callback) raf.callback();
				}
			};
			set_now(() => raf.time);
			set_raf((cb) => {
				raf.callback = () => {
					raf.callback = null;
					cb(raf.time);
					flush();
				};
			});

			mod = await load('./main.svelte');
			SvelteComponent = mod.default;

			// Put things we need on window for testing
			// @ts-expect-error
			window.SvelteComponent = SvelteComponent;
			window.location.href = '';
			window.document.title = '';
			window.document.head.innerHTML = '';
			window.document.body.innerHTML = '<main></main>';

			const target = window.document.querySelector('main');
			let snapshot = undefined;

			if (hydrate && from_ssr_html) {
				const load_ssr = create_loader({ ...compile_options, generate: 'ssr' }, cwd);

				// ssr into target
				if (config.before_test) config.before_test();
				const SsrSvelteComponent = (await load_ssr('./main.svelte')).default;
				const { html } = SsrSvelteComponent.render(config.props);
				target.innerHTML = html;

				if (config.snapshot) {
					snapshot = config.snapshot(target);
				}

				if (config.after_test) config.after_test();
			} else {
				target.innerHTML = '';
			}

			if (config.before_test) config.before_test();

			const warnings = [];
			const warn = console.warn;
			console.warn = (warning) => {
				warnings.push(warning);
			};

			const options = Object.assign(
				{},
				{
					target,
					hydrate,
					props: config.props,
					intro: config.intro
				},
				config.options || {}
			);

			const component = new SvelteComponent(options);

			console.warn = warn;

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
				assert_html_equal_with_options(target.innerHTML, config.html, {
					withoutNormalizeHtml: config.withoutNormalizeHtml
				});
			}

			try {
				if (config.test) {
					await config.test({
						assert: {
							...assert,
							htmlEqual: assert_html_equal,
							htmlEqualWithOptions: assert_html_equal_with_options
						},
						component,
						mod,
						target,
						snapshot,
						window,
						raf,
						compileOptions: compile_options,
						load
					});
				}
			} finally {
				component.$destroy();
				assert_html_equal(target.innerHTML, '');

				// TODO: This seems useless, unhandledRejection is only triggered on the next task
				// by which time the test has already finished and the next test resets it to null above
				if (unhandled_rejection) {
					throw unhandled_rejection; // eslint-disable-line no-unsafe-finally
				}
			}
		}

		await test()
			.catch((err) => {
				if (config.error && !unintended_error) {
					if (typeof config.error === 'function') {
						config.error(assert, err);
					} else {
						assert.equal(err.message, config.error);
					}
				} else {
					for (const file of glob('**/*.svelte', { cwd })) {
						if (file[0] === '_') continue;

						const dir = `${cwd}/_output/${hydrate ? 'hydratable' : 'normal'}`;
						const out = `${dir}/${file.replace(/\.svelte$/, '.js')}`;

						mkdirp(path.dirname(out)); // file could be in subdirectory, therefore don't use dir

						const { js } = compile(fs.readFileSync(`${cwd}/${file}`, 'utf-8').replace(/\r/g, ''), {
							...compile_options,
							filename: file
						});
						fs.writeFileSync(out, js.code);
					}

					throw err;
				}
			})
			.catch((err) => {
				failed.add(dir);
				// print a clickable link to open the directory
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;

				throw err;
			})
			.finally(async () => {
				flush();

				if (config.after_test) config.after_test();

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
			});
	});
}

// There are a lot of tests in this suite, which take up a lot of time.
// Split them into groups so that they can run in parallel and finish faster.
export function run_shard(id, total_shards) {
	assert.isAtMost(id, total_shards);

	const samples = fs.readdirSync(`${__dirname}/samples`);
	const shard_size = Math.ceil(samples.length / total_shards);

	const start = (id - 1) * shard_size;
	const end = id * shard_size;
	const to_run = samples.slice(start, end);

	describe(`runtime_${id}`, async () => {
		await Promise.all(to_run.map((dir) => run_test(dir)));
	});
}
