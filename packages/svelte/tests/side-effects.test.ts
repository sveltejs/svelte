import { assert, it } from 'vitest';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';

/** Resolves `svelte` through node_modules, so its `sideEffects` field applies. */
async function bundle(entry: string) {
	const side_effects: Record<string, unknown> = {};
	const build = await rollup({
		input: 'entry',
		plugins: [
			virtual({ entry }),
			nodeResolve(),
			{
				name: 'collect',
				moduleParsed(info) {
					side_effects[info.id.replaceAll('\\', '/')] = info.moduleSideEffects;
				}
			}
		],
		// kept as `import '...'` in the output if a module importing them is retained
		external: ['aria-query', 'axobject-query'],
		onwarn: () => {}
	});
	const { output } = await build.generate({});
	return { code: output[0].code, side_effects };
}

it('treeshakes a11y deps when only `parse` is used', async () => {
	const { code } = await bundle(`import { parse } from 'svelte/compiler'; parse('');`);

	assert.notInclude(code, 'aria-query');
	assert.notInclude(code, 'axobject-query');
});

it('keeps side effects of modules compiled components import bare', async () => {
	const ids = ['disclose-version', 'flags/legacy', 'flags/async', 'flags/tracing'];
	const { side_effects } = await bundle(
		ids.map((id) => `import 'svelte/internal/${id}';`).join('\n')
	);

	for (const id of ids) {
		const file = Object.keys(side_effects).find((f) => f.endsWith(`/src/internal/${id}.js`));
		assert.equal(file && side_effects[file], true, id);
	}
});
