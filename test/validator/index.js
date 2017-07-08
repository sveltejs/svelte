import * as fs from "fs";
import assert from "assert";
import { svelte, tryToLoadJson } from "../helpers.js";

describe("validate", () => {
	fs.readdirSync("test/validator/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			const filename = `test/validator/samples/${dir}/input.html`;
			const input = fs.readFileSync(filename, "utf-8").replace(/\s+$/, "");

			try {
				const warnings = [];

				svelte.compile(input, {
					onwarn(warning) {
						warnings.push({
							message: warning.message,
							pos: warning.pos,
							loc: warning.loc
						});
					}
				});

				const expectedWarnings =
					tryToLoadJson(`test/validator/samples/${dir}/warnings.json`) || [];

				assert.deepEqual(warnings, expectedWarnings);
			} catch (err) {
				try {
					const expected = require(`./samples/${dir}/errors.json`)[0];

					assert.equal(err.message, expected.message);
					assert.deepEqual(err.loc, expected.loc);
					assert.equal(err.pos, expected.pos);
				} catch (err2) {
					throw err2.code === "MODULE_NOT_FOUND" ? err : err2;
				}
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
