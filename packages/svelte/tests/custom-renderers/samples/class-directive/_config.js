import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<div class="base">content</div> <button>toggle</button>',
	test({ assert, target, serialize, dispatch_event }) {
		const button = target.children.find(
			(/**@type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		// Click to add the "active" class
		dispatch_event(button, 'click');
		flushSync();

		assert.equal(
			serialize(target),
			'<div class="base active">content</div> <button>toggle</button>'
		);

		// Click again to remove the "active" class
		dispatch_event(button, 'click');
		flushSync();

		assert.equal(serialize(target), '<div class="base">content</div> <button>toggle</button>');
	}
});
