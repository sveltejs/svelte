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

		// Call the handler with a plain object that is NOT a DOM Event.
		// If handle_event_propagation is called, it will fail because
		// it tries to access DOM-specific properties like composedPath, ownerDocument, etc.
		for (const { handler } of listeners) {
			handler.call(button, { type: 'click' });
		}
		flushSync();

		assert.deepEqual(logs, [{ type: 'click' }]);
	}
});
