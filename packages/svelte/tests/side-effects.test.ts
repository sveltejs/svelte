import { assert, it } from 'vitest';
import { rollup } from 'rollup';
import virtual from '@rollup/plugin-virtual';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const REGEX_BARE_DEP = /^[@a-z]/;

it('treeshakes a11y deps when only `parse` is used', async () => {
	const bundle = await rollup({
		input: 'entry',
		plugins: [
			virtual({ entry: `import { parse } from 'svelte/compiler'; parse('');` }),
			nodeResolve()
		],
		// kept as `import 'dep'` in the output if a module importing them is retained
		external: (id) => !id.startsWith('svelte') && REGEX_BARE_DEP.test(id),
		onwarn: () => {}
	});
	const { output } = await bundle.generate({});

	assert.notInclude(output[0].code, 'aria-query');
	assert.notInclude(output[0].code, 'axobject-query');
});

it('keeps side effects of modules compiled components import bare', async () => {
	const ids = ['disclose-version', 'flags/legacy', 'flags/async', 'flags/tracing'];
	const side_effects: Record<string, unknown> = {};

	await rollup({
		input: 'entry',
		plugins: [
			virtual({ entry: ids.map((id) => `import 'svelte/internal/${id}';`).join('\n') }),
			nodeResolve(),
			{
				name: 'collect',
				buildEnd() {
					for (const id of this.getModuleIds()) {
						side_effects[id.replaceAll('\\', '/')] = this.getModuleInfo(id)?.moduleSideEffects;
					}
				}
			}
		],
		onwarn: () => {}
	});

	for (const id of ids) {
		const file = Object.keys(side_effects).find((f) => f.endsWith(`/src/internal/${id}.js`));
		assert.equal(file && side_effects[file], true, id);
	}
});
