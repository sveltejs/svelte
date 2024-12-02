import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
		`
		);
	}
});
