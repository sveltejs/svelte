import * as fs from "fs";
import assert from "assert";
import { svelte, loadConfig, tryToLoadJson } from "../helpers.js";

describe.only("validate", () => {
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

			function test(input, expectedWarnings, expectedErrors) {
				let error;

				try {
					const warnings = [];

					const { stats } = svelte.compile(input, {
						onwarn(warning) {
							const { code, message, pos, loc, end } = warning;
							warnings.push({ code, message, pos, loc, end });
						},
						dev: config.dev
					});

					assert.equal(stats.warnings.length, warnings.length);
					stats.warnings.forEach((full, i) => {
						const lite = warnings[i];
						assert.deepEqual({
							code: full.code,
							message: full.message,
							pos: full.pos,
							loc: full.loc,
							end: full.end
						}, lite);
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

					assert.equal(error.code, expected.code);
					assert.equal(error.message, expected.message);
					assert.deepEqual(error.loc, expected.loc);
					assert.deepEqual(error.end, expected.end);
					assert.equal(error.pos, expected.pos);
				}
			}

			// TODO remove the v1 tests
			test(
				fs.readFileSync(`test/validator/samples/${dir}/input.html`, "utf-8").replace(/\s+$/, ""),
				tryToLoadJson(`test/validator/samples/${dir}/warnings.json`) || [],
				tryToLoadJson(`test/validator/samples/${dir}/errors.json`)
			);

			if (fs.existsSync(`test/validator/samples/${dir}/input-v2.html`)) {
				test(
					fs.readFileSync(`test/validator/samples/${dir}/input-v2.html`, "utf-8").replace(/\s+$/, ""),
					tryToLoadJson(`test/validator/samples/${dir}/warnings-v2.json`) || [],
					tryToLoadJson(`test/validator/samples/${dir}/errors-v2.json`)
				);
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
					code: warning.code,
					message: warning.message,
					pos: warning.pos,
					loc: warning.loc
				});
			}
		});
		assert.deepEqual(warnings, [
			{
				code: `options-lowercase-name`,
				message: "options.name should be capitalised",
				pos: undefined,
				loc: undefined
			}
		]);
	});

	it("does not warn if options.name begins with non-alphabetic character", () => {
		const warnings = [];
		svelte.compile("<div></div>", {
			name: "_",
			onwarn(warning) {
				warnings.push({
					code: warning.code,
					message: warning.message,
					pos: warning.pos,
					loc: warning.loc
				});
			}
		});
		assert.deepEqual(warnings, []);
	});
});
