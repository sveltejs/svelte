import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as glob from 'tiny-glob/sync.js';

import {
	showOutput,
	loadConfig,
	loadSvelte,
	setupHtmlEqual,
	tryToLoadJson,
	shouldUpdateExpected,
	mkdirp
} from "../helpers.js";

function tryToReadFile(file) {
	try {
		return fs.readFileSync(file, "utf-8");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
		return null;
	}
}

const sveltePath = process.cwd().split('\\').join('/');
let compile = null;

describe("ssr", () => {
	before(() => {
		require("../../register")({
			extensions: ['.svelte', '.html'],
			sveltePath
		});

		compile = loadSvelte(true).compile;

		return setupHtmlEqual();
	});

	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test, or
		// .show to always show the output. or both
		const solo = /\.solo/.test(dir);
		const show = /\.show/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			dir = path.resolve(`${__dirname}/samples`, dir);
			try {
				const Component = require(`${dir}/main.svelte`).default;

				const expectedHtml = tryToReadFile(`${dir}/_expected.html`);
				const expectedCss = tryToReadFile(`${dir}/_expected.css`) || "";

				const props = tryToLoadJson(`${dir}/data.json`) || undefined;

				const rendered = Component.render(props);
				const { html, css, head } = rendered;

				fs.writeFileSync(`${dir}/_actual.html`, html);
				if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

				try {
					assert.htmlEqual(html, expectedHtml);
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
						css.code.replace(/^\s+/gm, ""),
						expectedCss.replace(/^\s+/gm, "")
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

				if (show) showOutput(dir, { generate: 'ssr', format: 'cjs' });
			} catch (err) {
				showOutput(dir, { generate: 'ssr', format: 'cjs' });
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), dir)}/main.svelte`;
				throw err;
			}
		});
	});

	// duplicate client-side tests, as far as possible
	fs.readdirSync("test/runtime/samples").forEach(dir => {
		if (dir[0] === ".") return;

		const config = loadConfig(`./runtime/samples/${dir}/_config.js`);
		const solo = config.solo || /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		if (config.skip_if_ssr) return;

		(config.skip ? it.skip : solo ? it.only : it)(dir, () => {
			const cwd = path.resolve("test/runtime/samples", dir);

			Object.keys(require.cache)
				.filter(x => x.endsWith('.svelte'))
				.forEach(file => {
					delete require.cache[file];
				});

			delete global.window;

			const compileOptions = Object.assign({ sveltePath }, config.compileOptions, {
				generate: 'ssr',
				format: 'cjs'
			});

			require("../../register")(compileOptions);

			glob('**/*.svelte', { cwd }).forEach(file => {
				if (file[0] === '_') return;

				const dir  = `${cwd}/_output/ssr`;
				const out = `${dir}/${file.replace(/\.svelte$/, '.js')}`;

				if (fs.existsSync(out)) {
					fs.unlinkSync(out);
				}

				mkdirp(dir);

				try {
					const { js } = compile(
						fs.readFileSync(`${cwd}/${file}`, 'utf-8'),
						{
							...compileOptions,
							filename: file
						}
					);

					fs.writeFileSync(out, js.code);
				} catch (err) {
					// do nothing
				}
			});

			try {
				if (config.before_test) config.before_test();

				const Component = require(`../runtime/samples/${dir}/main.svelte`).default;
				const { html } = Component.render(config.props, {
					store: (config.store !== true) && config.store
				});

				if (config.ssrHtml) {
					assert.htmlEqual(html, config.ssrHtml);
				} else if (config.html) {
					assert.htmlEqual(html, config.html);
				}

				if (config.after_test) config.after_test();

				if (config.show) {
					showOutput(cwd, compileOptions);
				}
			} catch (err) {
				err.stack += `\n\ncmd-click: ${path.relative(process.cwd(), cwd)}/main.svelte`;

				if (config.error) {
					if (typeof config.error === 'function') {
						config.error(assert, err);
					} else {
						assert.equal(err.message, config.error);
					}
				} else {
					showOutput(cwd, compileOptions);
					throw err;
				}
			}
		});
	});
});
