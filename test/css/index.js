import assert from "assert";
import * as fs from "fs";
import { env, normalizeHtml, svelte } from "../helpers.js";

function tryRequire(file) {
	try {
		return require(file).default;
	} catch (err) {
		if (err.code !== "MODULE_NOT_FOUND") throw err;
		return null;
	}
}

describe("css", () => {
	fs.readdirSync("test/css/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			const config = tryRequire(`./samples/${dir}/_config.js`) || {};
			const input = fs
				.readFileSync(`test/css/samples/${dir}/input.html`, "utf-8")
				.replace(/\s+$/, "");

			const dom = svelte.compile(input, Object.assign(config, {
				format: 'iife',
				name: 'SvelteComponent'
			}));

			const ssr = svelte.compile(input, Object.assign(config, {
				format: 'iife',
				generate: 'ssr',
				name: 'SvelteComponent'
			}));

			assert.equal(dom.css, ssr.css);

			fs.writeFileSync(`test/css/samples/${dir}/_actual.css`, dom.css);
			const expected = {
				html: read(`test/css/samples/${dir}/expected.html`),
				css: read(`test/css/samples/${dir}/expected.css`)
			};

			assert.equal(dom.css.replace(/svelte-\d+/g, 'svelte-xyz').trim(), expected.css.trim());

			// verify that the right elements have scoping selectors
			if (expected.html !== null) {
				return env().then(window => {
					const Component = eval(`(function () { ${dom.code}; return SvelteComponent; }())`);
					const target = window.document.querySelector("main");

					new Component({ target, data: config.data });
					const html = target.innerHTML;

					fs.writeFileSync(`test/css/samples/${dir}/_actual.html`, html);

					// dom
					assert.equal(
						normalizeHtml(window, html).replace(/svelte-\d+/g, 'svelte-xyz'),
						normalizeHtml(window, expected.html)
					);

					// ssr
					const component = eval(`(function () { ${ssr.code}; return SvelteComponent; }())`);

					assert.equal(
						normalizeHtml(window, component.render(config.data)).replace(/svelte-\d+/g, 'svelte-xyz'),
						normalizeHtml(window, expected.html)
					);
				});
			}
		});
	});
});

function read(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch(err) {
		return null;
	}
}