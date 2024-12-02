import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div>x</div>',

	test({ assert, target, window }) {
		const event = new window.Event('resize');

		Object.defineProperties(window, {
			innerWidth: {
				value: 567,
				configurable: true
			},
			innerHeight: {
				value: 456,
				configurable: true
			}
		});

		window.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>567x456</div>
		`
		);
	}
});
