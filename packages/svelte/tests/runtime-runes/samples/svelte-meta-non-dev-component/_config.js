import { test } from '../../test';

export default test({
	// the stand-in component can't hydrate
	mode: ['client'],
	compileOptions: {
		dev: true
	},

	test({ target, assert }) {
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<section></section><p>after</p>');

		const [section] = output.querySelectorAll('section');
		const [p] = output.querySelectorAll('p');

		// The foreign component's element must not take the location of the following element
		// @ts-expect-error
		assert.equal(section.__svelte_meta, null);
		// @ts-expect-error
		assert.deepEqual(p.__svelte_meta?.loc, { file: 'main.svelte', line: 7, column: 1 });
	}
});
