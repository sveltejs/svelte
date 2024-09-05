import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createBundle } from 'dts-buddy';

const dir = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf-8'));

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

await createBundle({
	output: `${dir}/types/index.d.ts`,
	compilerOptions: {
		// so that types/properties with `@internal` (and its dependencies) are removed from the output
		stripInternal: true
	},
	modules: {
		[pkg.name]: `${dir}/src/index.d.ts`,
		[`${pkg.name}/action`]: `${dir}/src/action/public.d.ts`,
		[`${pkg.name}/animate`]: `${dir}/src/animate/public.d.ts`,
		[`${pkg.name}/compiler`]: `${dir}/src/compiler/public.d.ts`,
		[`${pkg.name}/easing`]: `${dir}/src/easing/index.js`,
		[`${pkg.name}/legacy`]: `${dir}/src/legacy/legacy-client.js`,
		[`${pkg.name}/motion`]: `${dir}/src/motion/public.d.ts`,
		[`${pkg.name}/reactivity`]: `${dir}/src/reactivity/index-client.js`,
		[`${pkg.name}/server`]: `${dir}/src/server/index.d.ts`,
		[`${pkg.name}/store`]: `${dir}/src/store/public.d.ts`,
		[`${pkg.name}/transition`]: `${dir}/src/transition/public.d.ts`,
		[`${pkg.name}/events`]: `${dir}/src/events/index.js`,
		// TODO remove in Svelte 6
		[`${pkg.name}/types/compiler/preprocess`]: `${dir}/src/compiler/preprocess/legacy-public.d.ts`,
		[`${pkg.name}/types/compiler/interfaces`]: `${dir}/src/compiler/types/legacy-interfaces.d.ts`
	}
});

const types = fs.readFileSync(`${dir}/types/index.d.ts`, 'utf-8');

const bad_links = [...types.matchAll(/\]\((\/[^)]+)\)/g)];
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

if (types.includes('\texport { ')) {
	// eslint-disable-next-line no-console
	console.error(
		`The generated types file should not contain 'export { ... }' statements. ` +
			`TypeScript is bad at following these: when creating d.ts files through @sveltejs/package, and one of these types is used, ` +
			`TypeScript will likely fail at generating a d.ts file. ` +
			`To prevent this, do 'export interface Foo {}' instead of 'interface Foo {}' and then 'export { Foo }'`
	);
	process.exit(1);
}
