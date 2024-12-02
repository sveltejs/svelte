import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>toggle</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
			<p>hello!</p>
		`
		);

		button.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>toggle</button>
		`
		);
	}
});
