import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div>1024x768</div><div>1</div>',

	before_test() {
		Object.defineProperties(window, {
			innerWidth: {
				value: 1024,
				configurable: true
			},
			innerHeight: {
				value: 768,
				configurable: true
			},
			devicePixelRatio: {
				value: 1,
				configurable: true
			}
		});
	},

	mode: ['client', 'hydrate'],

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
			},
			devicePixelRatio: {
				value: 2,
				configurable: true
			}
		});

		window.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>567x456</div><div>2</div>
		`
		);
	}
});
