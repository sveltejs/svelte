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
				`test/sourcemaps/samples/${dir}/output.js`
			);

			const input = fs.readFileSync(filename, "utf-8").replace(/\s+$/, "");
			const { code, map } = svelte.compile(input, {
				filename,
				outputFilename
			});

			fs.writeFileSync(
				outputFilename,
				`${code}\n//# sourceMappingURL=output.js.map`
			);
			fs.writeFileSync(
				`${outputFilename}.map`,
				JSON.stringify(map, null, "  ")
			);

			assert.deepEqual(map.sources, ["input.html"]);

			const { test } = require(`./samples/${dir}/test.js`);

			const smc = new SourceMapConsumer(map);

			const locateInSource = getLocator(input);
			const locateInGenerated = getLocator(code);

			test({ assert, code, map, smc, locateInSource, locateInGenerated });
		});
	});
});
