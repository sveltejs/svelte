import * as svelte from '../../src/compiler/index.ts';
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
async function try_require(file) {
	try {
		const mod = await import(file);
		return mod.default || mod;
	} catch (err) {
		return null;
	}
}

function normalize_warning(warning) {
	warning.frame = warning.frame
		.replace(/^\n/, '')
		.replace(/^\t+/gm, '')
		.replace(/\s+$/gm, '');
	delete warning.filename;
	delete warning.toString;
	return warning;
}

	const __dirname = new URL('.', import.meta.url).pathname;
	const files = Deno.readDirSync(`${__dirname}/samples`);
	for (const dir of files) {

		if (dir[0] === '.') continue;
		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir.name);
		const skip = /\.skip/.test(dir.name);

		if (solo && Deno.env.get("CI")) {
			throw new Error('Forgot to remove `solo: true` from test');
		}
		Deno.test({ name: dir.name, only: skip, fn: async () => {
				const config = await try_require(`./samples/${dir.name}/_config.js`) || {};
				const input = Deno
					.readTextFileSync(`${__dirname}/samples/${dir.name}/input.svelte`)
					.replace(/\s+$/, '')
					.replace(/\r/g, '');

				const expected_warnings = (config.warnings || []).map(normalize_warning);

				const dom = svelte.compile(
					input,
					Object.assign(config.compileOptions || {}, { format: 'cjs' })
				);

				const ssr = svelte.compile(
					input,
					Object.assign(config.compileOptions || {}, { format: 'cjs', generate: 'ssr' })
				);

				assertEquals(dom.css.code, ssr.css.code);

				const dom_warnings = dom.warnings.map(normalize_warning);
				const ssr_warnings = ssr.warnings.map(normalize_warning);

				assertEquals(dom_warnings, ssr_warnings);
				assertEquals(dom_warnings.map(normalize_warning), expected_warnings);

				await Deno.writeTextFile(`${__dirname}/samples/${dir.name}/_actual.css`, dom.css.code);
				const expected = {
					html: read(`${__dirname}/samples/${dir.name}/expected.html`),
					css: read(`${__dirname}/samples/${dir.name}/expected.css`)
				};

				const actual_css = dom.css.code.replace(/svelte(-ref)?-[a-z0-9]+/g, (m, $1) => $1 ? m : 'svelte-xyz');
				try {
					assertEquals(actual_css, expected.css);
				} catch (error) {
					if (shouldUpdateExpected()) {
						await Deno.writeTextFile(`${__dirname}/samples/${dir}/expected.css`, actual_css);
						console.log(`Updated ${dir}/expected.css.`);
					} else {
						throw error;
					}
				}
		}})

}

function shouldUpdateExpected() {
	return Deno.args.includes('--update');
}

function read(file) {
	try {
		return Deno.readTextFileSync(file);
	} catch (err) {
		return null;
	}
}
