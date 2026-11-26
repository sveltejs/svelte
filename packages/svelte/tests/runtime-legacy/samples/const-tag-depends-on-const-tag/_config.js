import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<input>
		<p>hello</p>
		<p>hello</p>
	`,

	ssrHtml: `
		<input value="hello">
		<p>hello</p>
		<p>hello</p>
	`,

	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');

		flushSync(() => {
			input.value = 'goodbye';
			input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<input>
				<p>goodbye</p>
				<p>goodbye</p>
			`
		);
	}
});
