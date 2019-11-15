import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import { svelte } from "../helpers.js";
import { SourceMapConsumer } from "source-map";
import { getLocator } from "locate-character";

describe("sourcemaps", () => {
	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : skip ? it.skip : it)(dir, async () => {
			const filename = path.resolve(
				`${__dirname}/samples/${dir}/input.svelte`
			);
			const outputFilename = path.resolve(
				`${__dirname}/samples/${dir}/output`
			);

			const input = fs.readFileSync(filename, "utf-8").replace(/\s+$/, "");
			const { js, css } = svelte.compile(input, {
				filename,
				outputFilename: `${outputFilename}.js`,
				cssOutputFilename: `${outputFilename}.css`
			});

			const _code = js.code.replace(/Svelte v\d+\.\d+\.\d+/, match => match.replace(/\d/g, 'x'));

			fs.writeFileSync(
				`${outputFilename}.js`,
				`${_code}\n//# sourceMappingURL=output.js.map`
			);
			fs.writeFileSync(
				`${outputFilename}.js.map`,
				JSON.stringify(js.map, null, "  ")
			);

			if (css.code) {
				fs.writeFileSync(
					`${outputFilename}.css`,
					`${css.code}\n/*# sourceMappingURL=output.css.map */`
				);
				fs.writeFileSync(
					`${outputFilename}.css.map`,
					JSON.stringify(css.map, null, "  ")
				);
			}

			assert.deepEqual(js.map.sources, ["input.svelte"]);
			if (css.map) assert.deepEqual(css.map.sources, ["input.svelte"]);

			const { test } = require(`./samples/${dir}/test.js`);

			const locateInSource = getLocator(input);

			const smc = await new SourceMapConsumer(js.map);
			const locateInGenerated = getLocator(_code);

			const smcCss = css.map && await new SourceMapConsumer(css.map);
			const locateInGeneratedCss = getLocator(css.code || '');

			test({ assert, code: _code, map: js.map, smc, smcCss, locateInSource, locateInGenerated, locateInGeneratedCss });
		});
	});
});
