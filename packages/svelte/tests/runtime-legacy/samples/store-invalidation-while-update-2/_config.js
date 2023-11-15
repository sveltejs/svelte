import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `
		<div></div>
		<div>simple</div>
		<input>
		<button>click me</button>
	`,
	ssrHtml: `
		<div></div>
		<div>simple</div>
		<input value="">
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
		<div>foo</div>
		<div>foo</div>
		<input>
		<button>click me</button>
		`
		);

		flushSync(() => button.dispatchEvent(clickEvent));
		assert.htmlEqual(
			target.innerHTML,
			`
		<div>foo</div>
		<div>clicked</div>
		<input>
		<button>click me</button>
		`
		);

		input.value = 'bar';
		flushSync(() => input.dispatchEvent(inputEvent));

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>bar</div>
		<div>bar</div>
		<input>
		<button>click me</button>
		`
		);
	}
});
