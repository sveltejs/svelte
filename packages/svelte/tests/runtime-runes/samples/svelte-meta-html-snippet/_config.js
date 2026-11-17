import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ target, assert }) {
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<span>child</span><b>html</b>');

		const [b] = output.querySelectorAll('b');

		// The `{@html}` tag is declared in main.svelte even though the snippet is rendered by
		// Receiver.svelte, and the child component rendered before it must not change that
		// @ts-expect-error
		assert.deepEqual(b.__svelte_meta.loc, { file: 'main.svelte', line: 8, column: 1 });
	}
});
