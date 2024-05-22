import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<div>toggle</div>
		<button>toggle</button>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const button = target.querySelector('button');
		ok(div);
		ok(button);
		const event = new window.MouseEvent('some-event');

		div.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
			<button>toggle</button>
			<p>hello!</p>
		`
		);

		button.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>toggle</div>
			<button>toggle</button>
		`
		);
	}
});
