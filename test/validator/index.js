import * as fs from "fs";
import assert from "assert";
import { svelte, loadConfig, tryToLoadJson } from "../helpers.js";

describe("validate", () => {
	fs.readdirSync("test/validator/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : skip ? it.skip : it)(dir, () => {
			const config = loadConfig(`./validator/samples/${dir}/_config.js`);
			const filename = `test/validator/samples/${dir}/input.html`;
			const input = fs.readFileSync(filename, "utf-8").replace(/\s+$/, "");

			const expectedWarnings = tryToLoadJson(`test/validator/samples/${dir}/warnings.json`) || [];
			const expectedErrors = tryToLoadJson(`test/validator/samples/${dir}/errors.json`);
			let error;

			try {
				const warnings = [];

				svelte.compile(input, {
					onwarn(warning) {
						warnings.push({
							message: warning.message,
							pos: warning.pos,
							loc: warning.loc
						});
					},
					dev: config.dev
				});

				assert.deepEqual(warnings, expectedWarnings);
			} catch (e) {
				error = e;
			}

			const expected = expectedErrors && expectedErrors[0];

			if (error || expected) {
				if (error && !expected) {
					throw error;
				}

				if (expected && !error) {
					throw new Error(`Expected an error: ${expected.message}`);
				}

				assert.equal(error.message, expected.message);
				assert.deepEqual(error.loc, expected.loc);
				assert.equal(error.pos, expected.pos);
			}
		});
	});

	it("errors if options.name is illegal", () => {
		assert.throws(() => {
			svelte.compile("<div></div>", {
				name: "not.valid"
			});
		}, /options\.name must be a valid identifier/);
	});

	it("warns if options.name is not capitalised", () => {
		const warnings = [];
		svelte.compile("<div></div>", {
			name: "lowercase",
			onwarn(warning) {
				warnings.push({
					message: warning.message,
					pos: warning.pos,
					loc: warning.loc
				});
			}
		});
		assert.deepEqual(warnings, [
			{
				message: "options.name should be capitalised",
				pos: undefined,
				loc: undefined
			}
		]);
	});
});
