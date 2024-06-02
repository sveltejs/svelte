import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>Mutate a</button>
		<div>{}</div>
	`,

	test({ assert, target }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		button?.dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Mutate a</button>
			<div>{"foo":42}</div>
		`
		);
	}
});
