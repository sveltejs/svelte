import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<h1>2</h1>
		<button>Increment</button>
	`,
	test({ assert, target }) {
		target
			.querySelector('button')
			?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>4</h1>
			<button>Increment</button>
		`
		);
	}
});
