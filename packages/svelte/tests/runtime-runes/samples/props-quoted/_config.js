import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	props: {
		'kebab-case': 'hello'
	},

	html: `hello`,

	async test({ assert, target, component }) {
		flushSync(() => (component['kebab-case'] = 'goodbye'));
		assert.htmlEqual(target.innerHTML, `goodbye`);
	}
});
