import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { globSync } from 'tinyglobby';
import { compile, compileModule, parse, migrate } from 'svelte/compiler';

const argv = parseArgs({ options: { runes: { type: 'boolean' } }, args: process.argv.slice(2) });

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

/**
 * @param {string} file
 * @param {string} contents
 */
function write(file, contents) {
	mkdirp(path.dirname(file));
	fs.writeFileSync(file, contents);
}

const svelte_modules = globSync('**/*.svelte', { cwd: `${cwd}/src` });
const js_modules = globSync('**/*.js', { cwd: `${cwd}/src` });

for (const generate of /** @type {const} */ (['client', 'server'])) {
	console.error(`\n--- generating ${generate} ---\n`);
	for (const file of svelte_modules) {
		const input = `${cwd}/src/${file}`;
		const source = fs.readFileSync(input, 'utf-8');

		const output_js = `${cwd}/output/${generate}/${file}.js`;
		const output_map = `${cwd}/output/${generate}/${file}.js.map`;
		const output_css = `${cwd}/output/${generate}/${file}.css`;

		mkdirp(path.dirname(output_js));

		if (generate === 'client') {
			const ast = parse(source, {
				modern: true
			});

			write(
				`${cwd}/output/ast/${file}.json`,
				JSON.stringify(
					ast,
					(key, value) => (typeof value === 'bigint' ? ['BigInt', value.toString()] : value),
					'\t'
				)
			);

			try {
				const migrated = migrate(source);
				write(`${cwd}/output/migrated/${file}`, migrated.code);
			} catch (e) {
				console.warn(`Error migrating ${file}`, e);
			}
		}

		const compiled = compile(source, {
			dev: false,
			filename: input,
			generate,
			runes: argv.values.runes,
			experimental: {
				async: true
			}
		});

		for (const warning of compiled.warnings) {
			console.warn(warning.code);
			console.warn(warning.frame);
		}

		write(output_js, compiled.js.code + '\n//# sourceMappingURL=' + path.basename(output_map));
		write(output_map, compiled.js.map.toString());

		// generate with fragments: 'tree'
		if (generate === 'client') {
			const compiled = compile(source, {
				dev: false,
				filename: input,
				generate,
				runes: argv.values.runes,
				fragments: 'tree',
				experimental: {
					async: true
				}
			});

			const output_js = `${cwd}/output/${generate}/${file}.tree.js`;
			const output_map = `${cwd}/output/${generate}/${file}.tree.js.map`;

			write(output_js, compiled.js.code + '\n//# sourceMappingURL=' + path.basename(output_map));
			write(output_map, compiled.js.map.toString());
		}

		if (compiled.css) {
			write(output_css, compiled.css.code);
		}
	}

	for (const file of js_modules) {
		const input = `${cwd}/src/${file}`;
		const source = fs.readFileSync(input, 'utf-8');

		const compiled = compileModule(source, {
			dev: false,
			filename: input,
			generate,
			experimental: {
				async: true
			}
		});

		const output_js = `${cwd}/output/${generate}/${file}`;

		mkdirp(path.dirname(output_js));
		write(output_js, compiled.js.code);
	}
}
