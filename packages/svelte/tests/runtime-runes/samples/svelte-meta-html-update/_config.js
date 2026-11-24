import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: {
		dev: true
	},

	test({ target, assert }) {
		const [output] = target.querySelectorAll('output');
		const [button] = target.querySelectorAll('button');

		const check = () => {
			const [b] = output.querySelectorAll('b');

			// the `{@html}` elements keep the stack of where the tag is declared,
			// even when they are re-created outside of the initial render
			// @ts-expect-error
			assert.deepEqual(b.__svelte_meta.parent, {
				file: 'main.svelte',
				type: 'if',
				line: 8,
				column: 1,
				parent: null
			});
		};

		assert.htmlEqual(output.innerHTML, '<b>one</b>');
		check();

		flushSync(() => button.click());

		assert.htmlEqual(output.innerHTML, '<b>two</b>');
		check();
	}
});
