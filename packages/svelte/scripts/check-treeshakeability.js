import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { compile } from 'svelte/compiler';

async function bundle_code(entry) {
	const bundle = await rollup({
		input: '__entry__',
		plugins: [
			virtual({
				__entry__: entry
			}),
			nodeResolve({
				exportConditions: ['production', 'import', 'browser', 'default']
			})
		],
		onwarn: (warning, handle) => {
			if (warning.code !== 'EMPTY_BUNDLE' && warning.code !== 'CIRCULAR_DEPENDENCY') {
				handle(warning);
			}
		}
	});

	const { output } = await bundle.generate({});

	if (output.length > 1) {
		throw new Error('errr what');
	}

	return output[0].code.trim();
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let failed = false;

// eslint-disable-next-line no-console
console.group('checking treeshakeability');

for (const key in pkg.exports) {
	// special cases
	if (key === './compiler') continue;
	if (key === './internal/disclose-version') continue;

	for (const type of ['browser', 'default']) {
		if (!pkg.exports[key][type]) continue;

		const subpackage = path.join(pkg.name, key);
		const resolved = path.resolve(pkg.exports[key][type]);
		const code = await bundle_code(`import ${JSON.stringify(resolved)}`);

		if (code === '') {
			// eslint-disable-next-line no-console
			console.error(`✅ ${subpackage} (${type})`);
		} else {
			// eslint-disable-next-line no-console
			console.error(code);
			// eslint-disable-next-line no-console
			console.error(`❌ ${subpackage} (${type})`);
			failed = true;
		}
	}
}

const client_main = path.resolve(pkg.exports['.'].browser);
const without_hydration = await bundle_code(
	// Use all features which contain hydration code to ensure it's treeshakeable
	compile(
		`
<script>
	import { mount } from ${JSON.stringify(client_main)}; mount();
	let foo;
</script>

<svelte:head><title>hi</title></svelte:head>

<a href={foo} class={foo}>a</a>
<a {...foo}>a</a>
<svelte:component this={foo} />
<svelte:element this={foo} />
<C {foo} />

{#if foo}
{/if}
{#each foo as bar}
{/each}
{#await foo}
{/await}
{#key foo}
{/key}
{#snippet x()}
{/snippet}

{@render x()}
{@html foo}
	`,
		{ filename: 'App.svelte' }
	).js.code
);
if (!without_hydration.includes('current_hydration_fragment')) {
	// eslint-disable-next-line no-console
	console.error(`✅ Hydration code treeshakeable`);
} else {
	// eslint-disable-next-line no-console
	console.error(without_hydration);
	// eslint-disable-next-line no-console
	console.error(`❌ Hydration code not treeshakeable`);
	failed = true;
}

// eslint-disable-next-line no-console
console.groupEnd();

if (failed) {
	process.exit(1);
}
