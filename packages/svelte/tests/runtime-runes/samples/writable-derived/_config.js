import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<input type="range"><input type="range"><p>0 * 2 = 0</p>
	`,

	ssrHtml: `
		<input type="range" value="0"><input type="range" value="0"><p>0 * 2 = 0</p>
	`,

	test({ assert, target, window }) {
		const [input1, input2] = target.querySelectorAll('input');

		flushSync(() => {
			input1.value = '10';
			input1.dispatchEvent(new window.Event('input', { bubbles: true }));
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="range"><input type="range"><p>10 * 2 = 20</p>`
		);

		flushSync(() => {
			input2.value = '99';
			input2.dispatchEvent(new window.Event('input', { bubbles: true }));
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="range"><input type="range"><p>10 * 2 = 99</p>`
		);

		flushSync(() => {
			input1.value = '20';
			input1.dispatchEvent(new window.Event('input', { bubbles: true }));
		});

		assert.htmlEqual(
			target.innerHTML,
			`<input type="range"><input type="range"><p>20 * 2 = 40</p>`
		);
	}
});
