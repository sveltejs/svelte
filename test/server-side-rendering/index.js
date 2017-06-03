import assert from "assert";
import * as fs from "fs";
import * as path from "path";

import {
	addLineNumbers,
	loadConfig,
	setupHtmlEqual,
	svelte,
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

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
}

describe("ssr", () => {
	before(() => {
		require(process.env.COVERAGE
			? "../../src/server-side-rendering/register.js"
			: "../../ssr/register");

		return setupHtmlEqual();
	});

	fs.readdirSync("test/server-side-rendering/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test, or
		// .show to always show the output. or both
		const solo = /\.solo/.test(dir);
		let show = /\.show/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			dir = path.resolve("test/server-side-rendering/samples", dir);
			const component = require(`${dir}/main.html`);

			const expectedHtml = tryToReadFile(`${dir}/_expected.html`);
			const expectedCss = tryToReadFile(`${dir}/_expected.css`) || "";

			const data = tryToLoadJson(`${dir}/data.json`);
			let html;
			let css;
			let error;

			try {
				html = component.render(data);
				css = component.renderCss().css;
			} catch (e) {
				show = true;
				error = e;
			}

			if (show) {
				fs.readdirSync(dir).forEach(file => {
					if (file[0] === "_") return;
					const source = fs.readFileSync(`${dir}/${file}`, "utf-8");
					const name = capitalize(file.slice(0, -path.extname(file).length));
					const { code } = svelte.compile(source, { generate: "ssr", name });
					console.group(file);
					console.log(addLineNumbers(code));
					console.groupEnd();
				});
			}

			if (error) throw error;

			fs.writeFileSync(`${dir}/_actual.html`, html);
			if (css) fs.writeFileSync(`${dir}/_actual.css`, css);

			assert.htmlEqual(html, expectedHtml);
			assert.equal(
				css.replace(/^\s+/gm, ""),
				expectedCss.replace(/^\s+/gm, "")
			);
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
			let compiled;

			try {
				const source = fs.readFileSync(
					`test/runtime/samples/${dir}/main.html`,
					"utf-8"
				);
				compiled = svelte.compile(source, { generate: "ssr" });
			} catch (err) {
				if (config.compileError) {
					config.compileError(err);
					return;
				} else {
					throw err;
				}
			}

			fs.readdirSync(`test/runtime/samples/${dir}`).forEach(file => {
				const resolved = require.resolve(`../runtime/samples/${dir}/${file}`);
				delete require.cache[resolved];
			});

			const component = require(`../runtime/samples/${dir}/main.html`);
			let html;

			try {
				html = component.render(config.data);

				if (config.html) {
					assert.htmlEqual(html, config.html);
				}
			} catch (err) {
				console.log(addLineNumbers(compiled.code)); // eslint-disable-line no-console
				throw err;
			}
		});
	});
});
