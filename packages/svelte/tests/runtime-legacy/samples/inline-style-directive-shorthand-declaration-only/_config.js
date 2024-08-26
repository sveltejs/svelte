import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p style="color: red;"></p>
		<p style="color: red;"></p>
		<button></button>
	`,

	test({ assert, target, window }) {
		const [p1, p2] = target.querySelectorAll('p');

		assert.equal(window.getComputedStyle(p1).color, 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(p2).color, 'rgb(255, 0, 0)');

		const btn = target.querySelector('button');
		btn?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p style="color: green;"></p>
			<p style="color: green;"></p>
			<button></button>
		`
		);

		assert.equal(window.getComputedStyle(p1).color, 'rgb(0, 128, 0)');
		assert.equal(window.getComputedStyle(p2).color, 'rgb(0, 128, 0)');
	}
});
