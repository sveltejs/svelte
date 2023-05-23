// @vitest-environment jsdom

import * as fs from 'node:fs';
import * as path from 'node:path';
import { setImmediate } from 'node:timers/promises';
import glob from 'tiny-glob/sync';
import { assert, describe, it } from 'vitest';
import { compile } from 'svelte/compiler';
import { create_loader, mkdirp, try_load_config } from '../helpers.js';
import { assert_html_equal, assert_html_equal_with_options } from '../html_equal.js';

// duplicate client-side tests, as far as possible
run_runtime_samples('runtime');
run_runtime_samples('runtime-browser');

function run_runtime_samples(suite) {
	const samples = path.resolve(__dirname, '..', suite, 'samples');

	describe(`ssr: ${suite}`, async () => {
		await Promise.all(fs.readdirSync(samples).map(run_test));
	});

	async function run_test(dir) {
		if (dir[0] === '.') return;

		const cwd = path.resolve(samples, dir);
		const config = await try_load_config(`${cwd}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);

		if (config.skip_if_ssr) return;
		const it_fn = config.skip ? it.skip : solo ? it.only : it;

		it_fn(dir, async () => {
			const compileOptions = {
				...config.compileOptions,
				generate: 'ssr'
			};

			const load = create_loader(compileOptions, cwd);

			try {
				if (config.before_test) config.before_test();

				const Component = (await load(`${cwd}/main.svelte`)).default;
				const { html } = Component.render(config.props, {
					store: config.store !== true && config.store
				});

				if (config.ssrHtml) {
					assert_html_equal_with_options(html, config.ssrHtml, {
						preserveComments: compileOptions.preserveComments,
						withoutNormalizeHtml: config.withoutNormalizeHtml
					});
				} else if (config.html) {
					assert_html_equal_with_options(html, config.html, {
						preserveComments: compileOptions.preserveComments,
						withoutNormalizeHtml: config.withoutNormalizeHtml
					});
				}

				if (config.test_ssr) {
					await config.test_ssr({
						assert: {
							...assert,
							htmlEqual: assert_html_equal,
							htmlEqualWithOptions: assert_html_equal_with_options
						},
						load
					});
				}

				if (config.after_test) config.after_test();
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;

				if (config.error) {
					if (typeof config.error === 'function') {
						config.error(assert, err);
					} else {
						assert.equal(err.message, config.error);
					}
				} else {
					glob('**/*.svelte', { cwd }).forEach((file) => {
						if (file[0] === '_') return;

						const dir = `${cwd}/_output/ssr`;
						const out = `${dir}/${file.replace(/\.svelte$/, '.js')}`;

						if (fs.existsSync(out)) {
							fs.unlinkSync(out);
						}

						mkdirp(dir);

						const { js } = compile(fs.readFileSync(`${cwd}/${file}`, 'utf-8'), {
							...compileOptions,
							filename: file
						});

						fs.writeFileSync(out, js.code);
					});

					throw err;
				}
			}

			// wait for vitest to report progress
			await setImmediate();
		});
	}
}
