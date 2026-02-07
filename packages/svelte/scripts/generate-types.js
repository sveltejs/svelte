import fs from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createBundle } from 'dts-buddy';

const dir = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf-8'));
const types_dir = `${dir}/types`;

// For people not using moduleResolution: 'bundler', we need to generate these files. Think about removing this in Svelte 6 or 7
// It may look weird, but the imports MUST be ending with index.js to be properly resolved in all TS modes
for (const name of ['action', 'animate', 'easing', 'motion', 'store', 'transition', 'legacy']) {
	fs.writeFileSync(`${dir}/${name}.d.ts`, "import './types/index.js';\n");
}

fs.writeFileSync(`${dir}/index.d.ts`, "import './types/index.js';\n");
fs.writeFileSync(`${dir}/compiler.d.ts`, "import './types/index.js';\n");

// TODO: Remove these in Svelte 6. They are here so that tooling (which historically made use of these) can support Svelte 4-6 in one minor version
fs.mkdirSync(`${dir}/types/compiler`, { recursive: true });
fs.writeFileSync(`${dir}/types/compiler/preprocess.d.ts`, "import '../index.js';\n");
fs.writeFileSync(`${dir}/types/compiler/interfaces.d.ts`, "import '../index.js';\n");

const import_paths = Object.fromEntries(
	Object.entries(pkg.imports).map(
		/** @param {[string,any]} import */ ([key, value]) => {
			return [key, [value.types ?? value.default ?? value]];
		}
	)
);

const base_compiler_options = {
	stripInternal: true,
	paths: import_paths
};

/** @param {string} text */
const unwrap_module = (text) => {
	const marker = "declare module '";
	const start = text.indexOf(marker);
	if (start === -1) return text;
	const brace_start = text.indexOf('{', start);
	if (brace_start === -1) return text;
	let depth = 0;
	let brace_end = -1;
	for (let i = brace_start; i < text.length; i += 1) {
		const ch = text[i];
		if (ch === '{') depth += 1;
		if (ch === '}') {
			depth -= 1;
			if (depth === 0) {
				brace_end = i;
				break;
			}
		}
	}
	if (brace_end === -1) return text;
	const body = text.slice(brace_start + 1, brace_end);
	return body.replace(/^\t/gm, '').trimStart() + '\n';
};

/** @param {string} text */
const exportify_top_level = (text) => {
	let depth = 0;
	let paren_depth = 0;
	return text
		.split('\n')
		.map((/** @param {string} line */ line) => {
			const trimmed = line.trimStart();
			if (depth === 0 && paren_depth === 0 && trimmed) {
				if (
					trimmed.startsWith('export ') ||
					trimmed.startsWith('import ') ||
					trimmed.startsWith('declare module ')
				) {
					// keep as-is
				} else if (trimmed.startsWith('declare ')) {
					const rest = trimmed.slice('declare '.length);
					if (/^(class|function|const|interface|type|namespace|enum)\b/.test(rest)) {
						line = line.replace(/^(\s*)declare\s+/, '$1export ');
					}
				} else if (/^(class|function|const|interface|type|namespace|enum)\b/.test(trimmed)) {
					line = line.replace(/^(\s*)/, '$1export ');
				}
			}

			for (const ch of line) {
				if (ch === '(') paren_depth += 1;
				if (ch === ')') paren_depth -= 1;
				if (ch === '{') depth += 1;
				if (ch === '}') depth -= 1;
			}
			return line;
		})
		.join('\n');
};

/** @param {string} text */

/** @param {string} text */
const strip_ambient = (text) => {
	const marker = "declare module '*.svelte'";
	const index = text.indexOf(marker);
	if (index === -1) return text;
	return text.slice(0, index).trimEnd() + '\n';
};

/** @param {string} text @param {Set<string>} names */
const strip_shared_types = (text, names) => {
	const lines = text.split('\n');
	const output = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const match = line.match(
			/^\t?export\s+(?:interface|type|class|function|const|enum|namespace)\s+([A-Za-z_]\w*)/
		);

		if (match && names.has(match[1])) {
			let seen_brace = line.includes('{');
			let done = false;
			i += 1;

			while (i < lines.length && !done) {
				const current = lines[i];
				if (!seen_brace && current.includes('{')) seen_brace = true;

				if (seen_brace) {
					if (/^\t?}\s*$/.test(current)) done = true;
				} else if (/;\s*$/.test(current)) {
					done = true;
				}

				i += 1;
			}

			continue;
		}

		output.push(line);
		i += 1;
	}

	return output.join('\n');
};

/** @param {string} file @param {string} contents */
const validate_types = (file, contents) => {
	const bad_links = [...contents.matchAll(/\]\((\/[^)]+)\)/g)];
	if (bad_links.length > 0) {
		// eslint-disable-next-line no-console
		console.error(
			`The following links in JSDoc annotations should be prefixed with https://svelte.dev:`
		);

		for (const [, link] of bad_links) {
			// eslint-disable-next-line no-console
			console.error(`- ${link}`);
		}

		process.exit(1);
	}

	if (contents.includes('\texport { ')) {
		// eslint-disable-next-line no-console
		console.error(
			`The generated types file should not contain 'export { ... }' statements. ` +
				`TypeScript is bad at following these: when creating d.ts files through @sveltejs/package, and one of these types is used, ` +
				`TypeScript will likely fail at generating a d.ts file. ` +
				`To prevent this, do 'export interface Foo {}' instead of 'interface Foo {}' and then 'export { Foo }'`
		);
		process.exit(1);
	}
};

/** @param {string} output @param {string} module_name @param {string} entry @param {Record<string, string[]>} extra_paths */
/**
 * @param {string} output
 * @param {string} module_name
 * @param {string} entry
 * @param {Record<string, string[]>} extra_paths
 * @param {{ strip_shared?: boolean; shared_exports?: Set<string> }} options
 */
const bundle_module = async (
	output,
	module_name,
	entry,
	extra_paths = {},
	{ strip_shared, shared_exports } = {}
) => {
	await createBundle({
		output,
		compilerOptions: {
			...base_compiler_options,
			paths: {
				...import_paths,
				...extra_paths
			}
		},
		modules: {
			[module_name]: entry
		}
	});

	let contents = fs.readFileSync(output, 'utf-8');
	contents = unwrap_module(contents);
	contents = exportify_top_level(contents);
	contents = strip_ambient(contents);
	if (strip_shared && shared_exports) {
		contents = strip_shared_types(contents, shared_exports);
	}
	fs.writeFileSync(output, contents);
	validate_types(output, contents);
};

fs.mkdirSync(types_dir, { recursive: true });

// Ambient globals + *.svelte module
const ambient_raw = fs.readFileSync(`${dir}/src/ambient.d.ts`, 'utf-8');
let ambient_fixed = ambient_raw;
ambient_fixed = ambient_fixed.replace(
	/import\s+\{\s*SvelteComponent\s*\}\s+from\s+'svelte';?/,
	"type SvelteComponent = import('./shared').SvelteComponent;"
);
ambient_fixed = ambient_fixed.replace(
	/import\s+\{\s*LegacyComponentType\s*\}\s+from\s+'svelte\/legacy';?/,
	"type LegacyComponentType = import('./legacy').LegacyComponentType;"
);
fs.writeFileSync(`${types_dir}/ambient.d.ts`, ambient_fixed);

// Shared core types
await bundle_module(`${types_dir}/shared.d.ts`, pkg.name, `${dir}/src/index.d.ts`);
/** @type {Set<string>} */
const shared_exports = new Set(
	fs
		.readFileSync(`${types_dir}/shared.d.ts`, 'utf-8')
		.split('\n')
		.map((line) => {
			const match = line.match(
				/^\t?export\s+(?:interface|type|class|function|const|enum|namespace)\s+([A-Za-z_]\w*)/
			);
			return match ? match[1] : null;
		})
		.filter((/** @param {string | null} name */ name) => name !== null)
);

// Legacy first so other entrypoints can reference it
await bundle_module(
	`${types_dir}/legacy.d.ts`,
	`${pkg.name}/legacy`,
	`${dir}/src/legacy/legacy-client.js`,
	{
		svelte: ['./types/shared.d.ts']
	},
	{ strip_shared: true, shared_exports }
);
{
	const output = `${types_dir}/legacy.d.ts`;
	const rel_prefix = './';
	const ambient_ref = `/// <reference path="${rel_prefix}ambient.d.ts" />\n`;
	const shared_ref = `export * from '${rel_prefix}shared';\n`;
	const shared_import = `import type { ${[...shared_exports].sort().join(', ')} } from '${rel_prefix}shared';\n`;
	const existing = fs.readFileSync(output, 'utf-8');
	const with_shared = shared_import + existing;
	fs.writeFileSync(output, ambient_ref + shared_ref + with_shared);
}

const entrypoints = [
	{ name: `${pkg.name}/action`, entry: `${dir}/src/action/public.d.ts`, out: 'action' },
	{ name: `${pkg.name}/animate`, entry: `${dir}/src/animate/public.d.ts`, out: 'animate' },
	{
		name: `${pkg.name}/attachments`,
		entry: `${dir}/src/attachments/public.d.ts`,
		out: 'attachments'
	},
	{
		name: `${pkg.name}/compiler`,
		entry: `${dir}/src/compiler/public.d.ts`,
		out: 'compiler',
		strip: false
	},
	{ name: `${pkg.name}/easing`, entry: `${dir}/src/easing/index.js`, out: 'easing' },
	{ name: `${pkg.name}/motion`, entry: `${dir}/src/motion/public.d.ts`, out: 'motion' },
	{
		name: `${pkg.name}/reactivity`,
		entry: `${dir}/src/reactivity/index-client.js`,
		out: 'reactivity'
	},
	{
		name: `${pkg.name}/reactivity/window`,
		entry: `${dir}/src/reactivity/window/index.js`,
		out: 'reactivity/window'
	},
	{ name: `${pkg.name}/server`, entry: `${dir}/src/server/index.d.ts`, out: 'server' },
	{ name: `${pkg.name}/store`, entry: `${dir}/src/store/public.d.ts`, out: 'store' },
	{ name: `${pkg.name}/transition`, entry: `${dir}/src/transition/public.d.ts`, out: 'transition' },
	{ name: `${pkg.name}/events`, entry: `${dir}/src/events/public.d.ts`, out: 'events' }
];

for (const item of entrypoints) {
	const output = `${types_dir}/${item.out}.d.ts`;
	const rel_prefix = item.out.includes('/') ? '../' : './';
	await bundle_module(
		output,
		item.name,
		item.entry,
		{
			svelte: ['./types/shared.d.ts'],
			'svelte/legacy': ['./types/legacy.d.ts']
		},
		{ strip_shared: item.strip !== false, shared_exports }
	);
	const ambient_ref = `/// <reference path="${rel_prefix}ambient.d.ts" />\n`;
	const shared_ref = `export * from '${rel_prefix}shared';\n`;
	const shared_import = `import type { ${[...shared_exports].sort().join(', ')} } from '${rel_prefix}shared';\n`;
	const existing = fs.readFileSync(output, 'utf-8');
	const with_shared = item.strip !== false ? shared_import + existing : existing;
	fs.writeFileSync(output, ambient_ref + shared_ref + with_shared);
}

// Root types entry
const index_output = `${types_dir}/index.d.ts`;
const index_contents = '/// <reference path="./ambient.d.ts" />\nexport * from \'./shared\';\n';
fs.writeFileSync(index_output, index_contents);
