import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { compile } from 'svelte/compiler';

/**
 * @param {string} entry
 */
async function bundle_code(entry) {
	const bundle = await rollup({
		input: '__entry__',
		plugins: [
			virtual({
				__entry__: entry
			}),
			{
				name: 'resolve-svelte',
				resolveId(importee) {
					if (importee.startsWith('svelte')) {
						const entry = pkg.exports[importee.replace('svelte', '.')];
						return path.resolve(entry.browser ?? entry.default);
					}
				}
			},
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
	if (key === './internal') continue;
	if (key === './internal/disclose-version') continue;
	if (key === './internal/flags/legacy') continue;
	if (key === './internal/flags/tracing') continue;

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
const bundle = await bundle_code(
	// Use all features which contain hydration code to ensure it's treeshakeable
	compile(
		`
<svelte:options runes />
<script>
	import { mount } from ${JSON.stringify(client_main)}; mount();
	let foo;
</script>

<svelte:head><title>hi</title></svelte:head>
<input bind:value={foo} />

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

/**
 * @param {string} case_name
 * @param {string[]} strings
 */
function check_bundle(case_name, ...strings) {
	for (const string of strings) {
		const index = bundle.indexOf(string);
		if (index >= 0) {
			// eslint-disable-next-line no-console
			console.error(`❌ ${case_name} not treeshakeable`);
			failed = true;

			let lines = bundle.slice(index - 500, index + 500).split('\n');
			const target_line = lines.findIndex((line) => line.includes(string));
			// mark the failed line
			lines = lines
				.map((line, i) => (i === target_line ? `> ${line}` : `| ${line}`))
				.slice(target_line - 5, target_line + 6);
			// eslint-disable-next-line no-console
			console.error('The first failed line:\n' + lines.join('\n'));
			return;
		}
	}
	// eslint-disable-next-line no-console
	console.error(`✅ ${case_name} treeshakeable`);
}

check_bundle('Hydration code', 'hydrate_node', 'hydrate_next');
check_bundle('Legacy code', 'component_context.l');
check_bundle('$inspect.trace', `'CreatedAt'`);

if (failed) {
	// eslint-disable-next-line no-console
	console.error('Full bundle at', path.resolve('scripts/_bundle.js'));
	fs.writeFileSync('scripts/_bundle.js', bundle);
}

// eslint-disable-next-line no-console
console.groupEnd();

if (failed) {
	process.exit(1);
}
