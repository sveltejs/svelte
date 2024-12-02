import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, window }) {
		assert.htmlEqual(target.innerHTML, `<input><p>hello</p>`);

		const input = target.querySelector('input');
		ok(input);

		input.value = 'goodbye';
		input.dispatchEvent(new window.Event('input'));

		flushSync();
		assert.htmlEqual(target.innerHTML, `<input><p>goodbye</p>`);
	},

	warnings: []
});
