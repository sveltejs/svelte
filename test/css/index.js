import assert from "assert";
import * as fs from "fs";
import { env, svelte } from "../helpers.js";

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
			const config = Object.assign(tryRequire(`./samples/${dir}/_config.js`) || {}, {
				format: 'iife',
				name: 'SvelteComponent'	
			});
			const input = fs
				.readFileSync(`test/css/samples/${dir}/input.html`, "utf-8")
				.replace(/\s+$/, "");

			const actual = svelte.compile(input, config);
			fs.writeFileSync(`test/css/samples/${dir}/_actual.css`, actual.css);
			const expected = {
				html: read(`test/css/samples/${dir}/expected.html`),
				css: read(`test/css/samples/${dir}/expected.css`)
			};

			assert.equal(actual.css.trim(), expected.css.trim());

			// verify that the right elements have scoping selectors
			if (expected.html !== null) {
				return env().then(window => {
					const Component = eval(`(function () { ${actual.code}; return SvelteComponent; }())`);
					const target = window.document.querySelector("main");

					new Component({ target });
					const html = target.innerHTML;

					fs.writeFileSync(`test/css/samples/${dir}/_actual.html`, html);

					assert.equal(html.trim(), expected.html.trim());
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