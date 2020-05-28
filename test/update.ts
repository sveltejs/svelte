import { readFileSync, writeFileSync } from 'fs';
import glob from 'tiny-glob/sync';
import assert from "assert";
export function update_expected(run, cwd) {
	const svelte = (function loadSvelte() {
		const resolved = require.resolve("../compiler.js");
		delete require.cache[resolved];
		return require(resolved);
	})();
	glob("samples/*/input.svelte", { cwd }).forEach((dir) => {
		function compile(options) {
			return svelte.compile(
				readFileSync(`${cwd}/${dir}`, "utf-8")
					.replace(/\s+$/, "")
					.replace(/\r/g, ""),
				options
			);
		}
		function check(target, value) {
			const path = `${cwd}/${dir.replace("input.svelte", target)}`;
			try {
				const previous = readFileSync(path, "utf-8");
				if (typeof value === "object") {
					assert.deepEqual(
						JSON.parse(previous),
						JSON.parse(JSON.stringify(value))
					);
				} else {
					assert.equal(
						previous.replace(/\s+$/, "").replace(/\r/g, ""),
						(value = value.replace(/\s+$/, "").replace(/\r/g, ""))
					);
				}
			} catch (e) {
				if (typeof value === "object")
					value = JSON.stringify(value, null, "\t");
				writeFileSync(path, value);
			}
		}
		function get_relative(name) {
			return `${cwd}/${dir.replace("input.svelte", name)}`;
		}

		run(compile, check, get_relative);
	});
}