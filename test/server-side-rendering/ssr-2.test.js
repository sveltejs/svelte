// @vitest-environment jsdom

import * as path from 'path';
import { describe, it, assert } from 'vitest';
import * as fs from 'fs';
import { try_load_config, mkdirp, create_loader } from '../helpers.js';
import { assert_html_equal } from '../html_equal';
import glob from 'tiny-glob/sync';
import { setTimeout } from 'timers/promises';

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
				generate: 'ssr',
				format: 'cjs'
			};

			const load = create_loader(compileOptions, cwd);

			glob('**/*.svelte', { cwd: cwd }).forEach((file) => {
				if (file[0] === '_') return;

				const dir = `${cwd}/_output/ssr`;
				const out = `${cwd}/${file.replace(/\.svelte$/, '.js')}`;

				if (fs.existsSync(out)) {
					fs.unlinkSync(out);
				}

				mkdirp(dir);

				try {
					const { js } = compile(fs.readFileSync(`${cwd}/${file}`, 'utf-8'), {
						...compileOptions,
						filename: file
					});

					fs.writeFileSync(out, js.code);
				} catch (err) {
					// do nothing
				}
			});

			try {
				if (config.before_test) config.before_test();

				const Component = (await load(`${cwd}/main.svelte`)).default;
				const { html } = Component.render(config.props, {
					store: config.store !== true && config.store
				});

				if (config.ssrHtml) {
					assert_html_equal(html, config.ssrHtml, {
						normalize_html: {
							preserveComments: compileOptions.preserveComments,
							withoutNormalizeHtml: config.withoutNormalizeHtml
						}
					});
				} else if (config.html) {
					assert_html_equal(html, config.html, {
						normalize_html: {
							preserveComments: compileOptions.preserveComments,
							withoutNormalizeHtml: config.withoutNormalizeHtml
						}
					});
				}

				if (config.test_ssr) {
					await config.test_ssr({
						assert: {
							...assert,
							htmlEqual: assert_html_equal
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
					throw err;
				}
			}

			// wait for vitest to report progress
			await setTimeout(10);
		});
	}
}
