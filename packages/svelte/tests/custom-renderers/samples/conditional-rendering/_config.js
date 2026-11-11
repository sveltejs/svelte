import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p>visible</p> <button>toggle</button>',
	test({ assert, target, serialize, dispatch_event }) {
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		dispatch_event(button, 'click');
		flushSync();

		let html = serialize(target);
		assert.equal(html, '<p>hidden</p> <button>toggle</button>');

		dispatch_event(button, 'click');
		flushSync();

		html = serialize(target);
		assert.equal(html, '<p>visible</p> <button>toggle</button>');
	}
});
