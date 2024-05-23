import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>a: {"foo":3,"bar":2}</p>
		<p>b: {"foo":3}</p>
		<button></button>
		<button></button>
	`,

	test({ assert, target, window }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		btn1.dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: {"foo":4,"bar":2}</p>
			<p>b: {"foo":4,"baz":0}</p>
			<button></button>
			<button></button>
		`
		);

		btn2.dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: {"foo":5,"bar":2}</p>
			<p>b: {"foo":5,"qux":0}</p>
			<button></button>
			<button></button>
		`
		);
	}
});
