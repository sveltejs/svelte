import { assert, it } from 'vitest';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/** Resolves `svelte` through node_modules, so its `sideEffects` field applies. */
async function bundle(entry: string) {
	const side_effects: Record<string, unknown> = {};
	const build = await rollup({
		input: 'entry',
		plugins: [
			virtual({ entry }),
			nodeResolve({ exportConditions: ['browser'] }),
			commonjs(),
			{
				name: 'collect-side-effects',
				moduleParsed(info) {
					side_effects[info.id.replaceAll('\\', '/')] = info.moduleSideEffects;
				}
			}
		],
		// kept as `import '...'` in the output if a module importing them is retained
		external: ['aria-query', 'axobject-query'],
		onwarn(warning, warn) {
			// an unresolved import becomes external, which would make the bundle trivially clean
			if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
			if (warning.code !== 'CIRCULAR_DEPENDENCY') warn(warning);
		}
	});
	const { output } = await build.generate({});
	return { code: output[0].code, side_effects };
}

it('treeshakes a11y deps when only parsing and printing', async () => {
	const { code } = await bundle(`export { parse, parseCss, print } from 'svelte/compiler';`);

	assert.notInclude(code, 'aria-query');
	assert.notInclude(code, 'axobject-query');
});

it('keeps side effects of modules that need them', async () => {
	const files: Record<string, string> = {
		// dev-only guard for runes outside `.svelte` files, lost if only re-exports are used
		svelte: 'index-client.js',
		// compiled components import these bare
		'svelte/internal/disclose-version': 'internal/disclose-version.js',
		'svelte/internal/flags/legacy': 'internal/flags/legacy.js',
		'svelte/internal/flags/async': 'internal/flags/async.js',
		'svelte/internal/flags/tracing': 'internal/flags/tracing.js'
	};
	const { side_effects } = await bundle(
		Object.keys(files)
			.map((id) => `import '${id}';`)
			.join('\n')
	);

	for (const [id, file] of Object.entries(files)) {
		const found = Object.keys(side_effects).find((f) => f.endsWith(`/src/${file}`));
		assert.ok(found, `${id} not bundled`);
		assert.equal(side_effects[found], true, id);
	}
});
