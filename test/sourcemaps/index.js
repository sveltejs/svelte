import * as fs from "fs";
import * as path from "path";
import assert from "assert";
import { svelte } from "../helpers.js";
import { SourceMapConsumer } from "source-map";
import { getLocator } from "locate-character";

describe("sourcemaps", () => {
	fs.readdirSync("test/sourcemaps/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			const filename = path.resolve(
				`test/sourcemaps/samples/${dir}/input.html`
			);
			const outputFilename = path.resolve(
				`test/sourcemaps/samples/${dir}/output`
			);

			const input = fs.readFileSync(filename, "utf-8").replace(/\s+$/, "");
			const { code, map, css, cssMap } = svelte.compile(input, {
				filename,
				outputFilename: `${outputFilename}.js`,
				cssOutputFilename: `${outputFilename}.css`
			});

			fs.writeFileSync(
				`${outputFilename}.js`,
				`${code}\n//# sourceMappingURL=output.js.map`
			);
			fs.writeFileSync(
				`${outputFilename}.js.map`,
				JSON.stringify(map, null, "  ")
			);

			if (css) {
				fs.writeFileSync(
					`${outputFilename}.css`,
					`${css}\n/*# sourceMappingURL=output.css.map */`
				);
				fs.writeFileSync(
					`${outputFilename}.css.map`,
					JSON.stringify(cssMap, null, "  ")
				);
			}

			assert.deepEqual(map.sources, ["input.html"]);
			if (cssMap) assert.deepEqual(cssMap.sources, ["input.html"]);

			const { test } = require(`./samples/${dir}/test.js`);

			const locateInSource = getLocator(input);

			const smc = new SourceMapConsumer(map);
			const locateInGenerated = getLocator(code);

			const smcCss = cssMap && new SourceMapConsumer(cssMap);
			const locateInGeneratedCss = getLocator(css || '');

			test({ assert, code, map, smc, smcCss, locateInSource, locateInGenerated, locateInGeneratedCss });
		});
	});
});
