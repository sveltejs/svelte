import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return {
			foo: 'x',
			bar: 'z',
			default1: 1,
			default2: undefined
		};
	},

	html: `x 1 2 3 z`,

	async test({ assert, target, component }) {
		flushSync(() => (component.foo = 'y'));
		assert.htmlEqual(target.innerHTML, `y 1 2 3 z`);

		flushSync(() => (component.bar = 'w'));
		assert.htmlEqual(target.innerHTML, `y 1 2 3 w`);
	}
});
