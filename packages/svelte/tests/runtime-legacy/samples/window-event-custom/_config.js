import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p>escaped: false</p>',

	test({ assert, target, window }) {
		const event = new window.KeyboardEvent('keydown', {
			key: 'Escape'
		});

		window.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>escaped: true</p>
		`
		);
	}
});
