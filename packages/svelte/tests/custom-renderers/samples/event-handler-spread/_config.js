import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>click me</button> <p>0</p>',
	test({ assert, target, serialize, logs }) {
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		assert.ok(button);

		const listeners = button.listeners?.click;
		assert.ok(listeners, 'button should have click listeners');

		// Call the handler with multiple arguments.
		// Custom renderers may pass multiple arguments to event handlers,
		// so we need to make sure all arguments are forwarded through spreads too.
		for (const { handler } of listeners) {
			handler.call(button, { type: 'click' }, 'extra', 42);
		}
		flushSync();

		const html = serialize(target);
		assert.equal(html, '<button>click me</button> <p>1</p>');

		// Verify all arguments were forwarded to the actual handler
		assert.deepEqual(logs, [{ type: 'click' }, 'extra', 42]);
	}
});
