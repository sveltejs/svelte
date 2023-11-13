import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `
		<input>
		<div></div>
		<div>simple</div>
		<button>click me</button>
	`,
	ssrHtml: `
		<input value="">
		<div></div>
		<div>simple</div>
		<button>click me</button>
	`,

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		const button = target.querySelector('button');
		ok(input);
		ok(button);

		const inputEvent = new window.InputEvent('input');
		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		input.value = 'foo';
		flushSync(() => input.dispatchEvent(inputEvent));

		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>foo</div>
		<div>foo</div>
		<button>click me</button>
		`
		);

		flushSync(() => button.dispatchEvent(clickEvent));
		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>foo</div>
		<div>clicked</div>
		<button>click me</button>
		`
		);

		input.value = 'bar';
		flushSync(() => input.dispatchEvent(inputEvent));

		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>bar</div>
		<div>bar</div>
		<button>click me</button>
		`
		);
	}
});
