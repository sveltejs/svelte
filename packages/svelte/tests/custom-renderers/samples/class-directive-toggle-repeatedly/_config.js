import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div>content</div> <button>toggle</button>',
	test({ assert, target, dispatch_event }) {
		const [div] = target.children;
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);

		// on, off, on: after toggling off there's no class attribute, as before the first toggle
		// (an empty attribute used to turn into a leading space when toggling on again)
		for (const expected of ['active', undefined, 'active']) {
			dispatch_event(button, 'click');
			flushSync();
			assert.equal(div.attributes.class, expected);
		}
	}
});
