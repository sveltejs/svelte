import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'tiny-glob/sync.js';
import minimist from 'minimist';
import { compile, compileModule, parse } from 'svelte/compiler';

const argv = minimist(process.argv.slice(2));

const cwd = fileURLToPath(new URL('.', import.meta.url)).slice(0, -1);

// empty output directory
if (fs.existsSync(`${cwd}/output`)) {
	for (const file of fs.readdirSync(`${cwd}/output`)) {
		if (file === '.gitkeep') continue;
		try {
			fs.rmSync(`${cwd}/output/${file}`, { recursive: true });
		} catch {}
	}
}

/** @param {string} dir */
function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
	} catch {}
}

const svelte_modules = glob('**/*.svelte', { cwd: `${cwd}/input` });
const js_modules = glob('**/*.js', { cwd: `${cwd}/input` });

for (const generate of ['client', 'server']) {
	console.error(`\n--- generating ${generate} ---\n`);
	for (const file of svelte_modules) {
		const input = `${cwd}/input/${file}`;
		const source = fs.readFileSync(input, 'utf-8');

		const output_js = `${cwd}/output/${generate}/${file}.js`;
		const output_map = `${cwd}/output/${generate}/${file}.js.map`;
		const output_css = `${cwd}/output/${generate}/${file}.css`;

		mkdirp(path.dirname(output_js));

		if (generate === 'client') {
			const ast = parse(source, {
				modern: true
			});

			fs.writeFileSync(`${cwd}/output/${file}.json`, JSON.stringify(ast, null, '\t'));
		}

		const compiled = compile(source, {
			dev: true,
			filename: input,
			generate,
			runes: argv.runes
		});

		fs.writeFileSync(
			output_js,
			compiled.js.code + '\n//# sourceMappingURL=' + path.basename(output_map)
		);
		fs.writeFileSync(output_map, compiled.js.map.toString());
		if (compiled.css) {
			fs.writeFileSync(output_css, compiled.css.code);
		}
	}

	for (const file of js_modules) {
		const input = `${cwd}/input/${file}`;
		const source = fs.readFileSync(input, 'utf-8');

		const compiled = compileModule(source, {
			filename: input,
			generate
		});

		const output_js = `${cwd}/output/${generate}/${file}`;

		mkdirp(path.dirname(output_js));
		fs.writeFileSync(output_js, compiled.js.code);
	}
}
