import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
	<button>Click Me</button>
	<div>Icon B</div>
	`,

	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		btn.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon A</div>
			`
		);

		btn.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon B</div>
			`
		);
	}
});
