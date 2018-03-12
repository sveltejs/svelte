import assert from "assert";
import * as fs from "fs";
import * as path from "path";
import glob from 'glob';

import {
	showOutput,
	loadConfig,
	setupHtmlEqual,
	tryToLoadJson
} from "../helpers.js";

function tryToReadFile(file) {
	try {
		return fs.readFileSync(file, "utf-8");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
		return null;
	}
}

describe("ssr", () => {
	before(() => {
		require("../../ssr/register")({
			extensions: ['.svelte', '.html'],
			store: true
		});

		return setupHtmlEqual();
	});

	fs.readdirSync("test/server-side-rendering/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test, or
		// .show to always show the output. or both
		const solo = /\.solo/.test(dir);
		const show = /\.show/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			dir = path.resolve("test/server-side-rendering/samples", dir);
			try {
				let component;

				const mainHtmlFile = `${dir}/main.html`;
				const mainSvelteFile = `${dir}/main.svelte`;
				if (fs.existsSync(mainHtmlFile)) {
					component = require(mainHtmlFile);
				} else if (fs.existsSync(mainSvelteFile)) {
					component = require(mainSvelteFile);
				}

				const expectedHtml = tryToReadFile(`${dir}/_expected.html`);
				const expectedCss = tryToReadFile(`${dir}/_expected.css`) || "";

				const data = tryToLoadJson(`${dir}/data.json`);

				const rendered = component.render(data);
				const { html, css, head } = rendered;

				// rendered.toString() === rendered.html
				assert.equal(rendered, html);

				fs.writeFileSync(`${dir}/_actual.html`, html);
				if (css.code) fs.writeFileSync(`${dir}/_actual.css`, css.code);

				assert.htmlEqual(html, expectedHtml);
				assert.equal(
					css.code.replace(/^\s+/gm, ""),
					expectedCss.replace(/^\s+/gm, "")
				);

				if (fs.existsSync(`${dir}/_expected-head.html`)) {
					fs.writeFileSync(`${dir}/_actual-head.html`, head);
					assert.htmlEqual(
						head,
						fs.readFileSync(`${dir}/_expected-head.html`, 'utf-8')
					);
				}

				if (show) showOutput(dir, { generate: 'ssr' });
			} catch (err) {
				showOutput(dir, { generate: 'ssr' });
				throw err;
			}
		});
	});

	// duplicate client-side tests, as far as possible
	fs.readdirSync("test/runtime/samples").forEach(dir => {
		if (dir[0] === ".") return;

		const config = loadConfig(`./runtime/samples/${dir}/_config.js`);

		if (config.solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		if (config["skip-ssr"]) return;

		(config.skip ? it.skip : config.solo ? it.only : it)(dir, () => {
			const cwd = path.resolve("test/runtime/samples", dir);

			glob.sync('**/*.html', { cwd: `test/runtime/samples/${dir}` }).forEach(file => {
				const resolved = require.resolve(`../runtime/samples/${dir}/${file}`);
				delete require.cache[resolved];
			});

			const compileOptions = Object.assign(config.compileOptions || {}, {
				store: !!config.store
			});

			require("../../ssr/register")(compileOptions);

			try {
				const component = require(`../runtime/samples/${dir}/main.html`);
				const { html } = component.render(config.data, {
					store: (config.store !== true) && config.store
				});

				if (config.html) {
					assert.htmlEqual(html, config.html);
				}
			} catch (err) {
				showOutput(cwd, { generate: "ssr" });
				throw err;
			}
		});
	});
});
