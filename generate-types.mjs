// This script generates the TypeScript definitions

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'fs';

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
		const imports = import_map.get(import_match[2]) || new Set();
		imports.add(import_match[4]);
		import_map.set(import_match[2], imports);
	}
  
	// Replace inline imports with their type names
	const transformed = input.replace(import_regex, "$4");
  
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
		.map(([path, types]) => `import { ${[...types].join(', ')} } from '${path}';`)
		.join("\n");
  
	return [import_statements, ...renamed_generics].join("\n");
}

for (const dir of readdirSync('types/runtime')) {
	if (dir.endsWith('.d.ts')) continue;

	modify(
		`types/runtime/${dir}/index.d.ts`,
		content => {
			// TODO adjust all d.ts files
			content = adjust(content);
			
			if (existsSync(`src/runtime/${dir}/public.d.ts`)) {
				copyFileSync(`src/runtime/${dir}/public.d.ts`, `types/runtime/${dir}/public.d.ts`);
				content + "\nexport * from './public.js'";
			}

			return content;
		}
	);
}

copyFileSync(`src/runtime/ambient.d.ts`, `types/runtime/ambient.d.ts`);
modify(`types/runtime/index.d.ts`, content => content + "\nimport './ambient.js'");
