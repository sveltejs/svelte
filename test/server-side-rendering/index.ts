import * as fs from 'fs';
import * as path from 'path';
import * as register from '../register';

import {
	assert,
	loadConfig,
	loadSvelte,
	setupHtmlEqual,
	tryToLoadJson,
	shouldUpdateExpected
} from '../helpers';
import { set_current_component } from '../../internal';

function tryToReadFile(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

const sveltePath = process.cwd().split('\\').join('/');

describe('ssr', () => {
	before(() => {
		register.setCompileOptions({
			generate: 'ssr'
		});
		register.setCompile(loadSvelte(true).compile);
		register.setOutputFolderName('ssr');

		return setupHtmlEqual();
	});

	let saved_window;
	before(() => saved_window = global.window);
	after(() => global.window = saved_window);

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === '.') return;

		const config = loadConfig(`${__dirname}/samples/${dir}/_config.js`);

		// add .solo to a sample directory name to only run that test, or
		// .show to always show the output. or both
		const solo = config.solo || /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error('Forgot to remove `solo: true` from test');
		}

		(solo ? it.only : it)(dir, (done) => {

			try {
				dir = path.resolve(`${__dirname}/samples`, dir);

				register.clearCompileOutputCache();
				register.clearRequireCache();
				const compileOptions = {
					sveltePath,
					...config.compileOptions,
					generate: 'ssr',
					format: 'cjs'
				};
				register.setCompileOptions(compileOptions);
				register.setOutputFolderName('ssr');

				const Component = require(`${dir}/main.svelte`).default;

				const expectedHtml = tryToReadFile(`${dir}/_expected.html`);
				const expectedCss = tryToReadFile(`${dir}/_expected.css`) || '';

				const props = tryToLoadJson(`${dir}/data.json`) || undefined;

				const rendered = Component.render(props);
				const { html, css, head } = rendered;

				fs.writeFileSync(`${dir}/_actual.html`, html);
				if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

				try {
					if (config.withoutNormalizeHtml) {
						assert.strictEqual(html.trim().replace(/\r\n/g, '\n'), expectedHtml.trim().replace(/\r\n/g, '\n'));
					} else {
						(compileOptions.preserveComments
							? assert.htmlEqualWithComments
							: assert.htmlEqual)(html, expectedHtml);
					}
				} catch (error) {
					if (shouldUpdateExpected()) {
						fs.writeFileSync(`${dir}/_expected.html`, html);
						console.log(`Updated ${dir}/_expected.html.`);
					} else {
						throw error;
					}
				}

				try {
					assert.equal(
						css.code.replace(/^\s+/gm, '').replace(/[\r\n]/g, ''),
						expectedCss.replace(/^\s+/gm, '').replace(/[\r\n]/g, '')
					);
				} catch (error) {
					if (shouldUpdateExpected()) {
						fs.writeFileSync(`${dir}/_expected.css`, css.code);
						console.log(`Updated ${dir}/_expected.css.`);
					} else {
						throw error;
					}
				}

				if (fs.existsSync(`${dir}/_expected-head.html`)) {
					fs.writeFileSync(`${dir}/_actual-head.html`, head);

					try {
						assert.htmlEqual(
							head,
							fs.readFileSync(`${dir}/_expected-head.html`, 'utf-8')
						);
					} catch (error) {
						if (shouldUpdateExpected()) {
							fs.writeFileSync(`${dir}/_expected-head.html`, head);
							console.log(`Updated ${dir}/_expected-head.html.`);
						} else {
							throw error;
						}
					}
				}

				done();
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), dir)}/main.svelte`;
				register.writeCompileOutputCacheToFile();
				done(err);
			} finally {
				set_current_component(null);
			}
		});
	});

	// duplicate client-side tests, as far as possible
	runRuntimeSamples('runtime');
	runRuntimeSamples('runtime-puppeteer');

	function runRuntimeSamples(suite) {
		fs.readdirSync(`test/${suite}/samples`).forEach(dir => {
			if (dir[0] === '.') return;

			const config = loadConfig(`./${suite}/samples/${dir}/_config.js`);
			const solo = config.solo || /\.solo/.test(dir);

			if (solo && process.env.CI) {
				throw new Error('Forgot to remove `solo: true` from test');
			}

			if (config.skip_if_ssr) return;

			(config.skip ? it.skip : solo ? it.only : it)(dir, () => {
				const cwd = path.resolve(`test/${suite}/samples`, dir);

				delete global.window;

				return Promise.resolve()
					.then(() => {
						register.clearCompileOutputCache();
						register.clearRequireCache();
						register.setCompileOptions({
							sveltePath,
							...config.compileOptions,
							generate: 'ssr',
							format: 'cjs'
						});
						register.setOutputFolderName('ssr');

						if (config.before_test) config.before_test();

						const Component = require(`../${suite}/samples/${dir}/main.svelte`).default;
						const { html } = Component.render(config.props, {
							store: (config.store !== true) && config.store
						});

						if (config.ssrHtml) {
							assert.htmlEqual(html, config.ssrHtml);
						} else if (config.html) {
							assert.htmlEqual(html, config.html);
						}

						if (config.test_ssr) {
							config.test_ssr({
								assert,
								require: function require_for_ssr(module: string) {
									register.clearRequireCache();
									register.setCompileOptions({
										sveltePath,
										generate: 'ssr',
										format: 'cjs'
									});
									return require(path.join(__dirname, `../${suite}/samples/${dir}`, module));
								}
							});
						}

						if (config.after_test) config.after_test();
						set_current_component(null);
					}).catch(err => {
						if (config.error) {
							if (typeof config.error === 'function') {
								config.error(assert, err);
							} else {
								assert.equal(err.message, config.error);
							}
						} else {
							throw err;
						}
					}).catch(err => {
						err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;
						register.writeCompileOutputCacheToFile();
						set_current_component(null);
						throw err;
					});
			});
		});
	}
});
