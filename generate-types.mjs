// This script generates the TypeScript definitions

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, statSync } from 'fs';

execSync('tsc -p src/compiler --emitDeclarationOnly && tsc -p src/runtime --emitDeclarationOnly', { stdio: 'inherit' });

function modify(path, modifyFn) {
	const content = readFileSync(path, 'utf8');
	writeFileSync(path, modifyFn(content));
}

function adjust(input) {
	// Remove typedef jsdoc (duplicated in the type definition)
	input = input.replace(/\/\*\*\n(\r)? \* @typedef .+?\*\//gs, '');
	input = input.replace(/\/\*\* @typedef .+?\*\//gs, '');

	// Extract the import paths and types
	const import_regex = /import\(("|')(.+?)("|')\)\.(\w+)/g;
	let import_match;
	const import_map = new Map();
  
	while ((import_match = import_regex.exec(input)) !== null) {
		const imports = import_map.get(import_match[2]) || new Map();
		let name = import_match[4];
		if ([...imports.keys()].includes(name)) continue;

		let i = 1;
		if (name === 'default') {
			name = import_match[2].split('/').pop().split('.').shift().replace(/[^a-z0-9]/gi, '_');
		}
		while ([...import_map].some(([path, names]) => path !== import_match[2] && names.has(name))) {
			name = `${name}${i++}`;
		}

		imports.set(import_match[4], name);
		import_map.set(import_match[2], imports);
	}
  
	// Replace inline imports with their type names
	const transformed = input.replace(import_regex, (_match, _quote, path, _quote2, name) => {
		return import_map.get(path).get(name);
	});
  
	// Remove/adjust @template, @param and @returns lines
	// TODO rethink if we really need to do this for @param and @returns, doesn't show up in hover so unnecessary
	const lines = transformed.split("\n");

	let filtered_lines = [];
	let removing = null;
	let openCount = 1;
	let closedCount = 0;

	for (let line of lines) {
		let start_removing = false;
		if (line.trim().startsWith("* @template")) {
			removing = "template";
			start_removing = true;
		}

		if (line.trim().startsWith("* @param {")) {
			openCount = 1;
			closedCount = 0;
			removing = "param";
			start_removing = true;
		}

		if (line.trim().startsWith("* @returns {")) {
			openCount = 1;
			closedCount = 0;
			removing = "returns";
			start_removing = true;
		}

		if (removing === "returns" || removing === "param") {
			let i = start_removing ? line.indexOf('{') + 1 : 0;
			for (; i < line.length; i++) {
				if (line[i] === "{") openCount++;
				if (line[i] === "}") closedCount++;
				if (openCount === closedCount) break;
			}
			if (openCount === closedCount) {
				line = start_removing ? (line.slice(0, line.indexOf('{')) + line.slice(i + 1)) : (` * @${removing} ` + line.slice(i + 1));
				removing = null;
			}
		}
	  
		if (removing && !start_removing && (line.trim().startsWith("* @") ||  line.trim().startsWith("*/"))) {
			removing = null;
		}
	  
		if (!removing) {
			filtered_lines.push(line);
		}
	}
  
	// Replace generic type names with their plain versions
	const renamed_generics = filtered_lines.map(line => {
		return line.replace(/(\W|\s)([A-Z][\w\d$]*)_\d+(\W|\s)/g, "$1$2$3");
	});
  
	// Generate the import statement for the types used
	const import_statements = Array.from(import_map.entries())
		.map(([path, names]) => {
			const default_name = names.get('default');
			names.delete('default');
			const default_import = default_name ? (default_name + (names.size ? ', ' : ' ')) : '';
			const named_imports = names.size ? `{ ${[...names.values()].join(', ')} } ` : '';
			return `import ${default_import}${named_imports}from '${path}';`
		})
		.join("\n");
  
	return [import_statements, ...renamed_generics].join("\n");
}

let did_replace = false;

function walk(dir) {
	const files = readdirSync(dir);
	const _dir = dir.slice('types/'.length)

	for (const file of files) {
		const path = `${dir}/${file}`;
		if (file.endsWith('.d.ts')) {
			modify(path, content => {
				content = adjust(content);

				if (file === 'index.d.ts' && existsSync(`src/${_dir}/public.d.ts`)) {
					copyFileSync(`src/${_dir}/public.d.ts`, `${dir}/public.d.ts`);
					content = "export * from './public.js';\n" + content;
				}

				if (file === 'Component.d.ts' && dir.includes('runtime')) {
					if (!content.includes('$set(props: Partial<Props>): void;\n}')) {
						throw new Error('Component.js was modified in a way that automatic patching of d.ts file no longer works. Please adjust it');
					} else {
						content = content.replace('$set(props: Partial<Props>): void;\n}', '$set(props: Partial<Props>): void;\n    [accessor:string]: any;\n}');
						did_replace = true;
					}
				}

				return content;
			});
		} else if (statSync(path).isDirectory()) {
			if (existsSync(`src/${_dir}/${file}/private.d.ts`)) {
				copyFileSync(`src/${_dir}/${file}/private.d.ts`, `${path}/private.d.ts`);
			}
			if (existsSync(`src/${_dir}/${file}/interfaces.d.ts`)) {
				copyFileSync(`src/${_dir}/${file}/interfaces.d.ts`, `${path}/interfaces.d.ts`);
			}
			walk(path);
		}
	}
}

walk('types');

if (!did_replace) {
	throw new Error('Component.js file in runtime does no longer exist so that automatic patching of the d.ts file no longer works. Please adjust it');
}

copyFileSync(`src/runtime/ambient.d.ts`, `types/runtime/ambient.d.ts`);
