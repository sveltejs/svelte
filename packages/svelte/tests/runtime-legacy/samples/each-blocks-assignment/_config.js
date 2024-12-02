import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	<button>Add</button>
	<span class="content">1</span>
	<button>Test</button>
	<span class="content">2</span>
	<button>Test</button>
	<span class="content">3</span>
	<button>Test</button>
	`,
	test({ assert, target, window }) {
		let [incrementBtn, ...buttons] = target.querySelectorAll('button');

		const clickEvent = new window.MouseEvent('click', { bubbles: true });
		buttons[0].dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">3</span>
			<button>Test</button>
		`
		);

		buttons[0].dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">3</span>
			<button>Test</button>
		`
		);

		buttons[2].dispatchEvent(clickEvent);
		flushSync();
		buttons[2].dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
		`
		);

		incrementBtn.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
			<span class="content">4</span>
			<button>Test</button>
		`
		);

		[incrementBtn, ...buttons] = target.querySelectorAll('button');

		buttons[3].dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
			<span class="content">8</span>
			<button>Test</button>
		`
		);
	}
});
