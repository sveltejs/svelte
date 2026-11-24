import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, serialize, logs }) {
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		const listeners = button.listeners?.click;
		assert.ok(listeners, 'button should have click listeners');

		// Call the handler with multiple arguments.
		// Custom renderers may pass multiple arguments to event handlers,
		// so we need to make sure all arguments are forwarded.
		for (const { handler } of listeners) {
			handler.call(button, { type: 'click' }, 'extra', 42);
		}
		flushSync();

		assert.deepEqual(logs, [{ type: 'click' }, 'extra', 42]);
	}
});
