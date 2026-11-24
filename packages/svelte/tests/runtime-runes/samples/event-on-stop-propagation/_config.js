import { flushSync } from 'svelte';
import { on } from 'svelte/events';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	test({ assert, target, logs, window }) {
		const [propagation, immediate, descendant, descendant_immediate, native, capture, root, reset] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const [section] = target.querySelectorAll('section');

		// These are registered after mount's own delegated listener at the same boundary.
		const cleanups = [
			on(target, 'click', () => logs.push('root first')),
			on(target, 'click', () => logs.push('root second'))
		];

		/** @type {[HTMLButtonElement, string][]} */
		const cases = [
			[propagation, 'delegated, first, second'],
			[immediate, 'delegated, first'],
			[descendant, 'descendant'],
			[descendant_immediate, 'descendant immediate'],
			[native, 'child, native, parent'],
			[capture, 'capture first, capture second'],
			[root, 'root descendant']
		];

		try {
			for (const [button, expected] of cases) {
				for (let i = 0; i < 2; i++) {
					button.click();
					flushSync();
					assert.htmlEqual(output.innerHTML, expected);
					assert.deepEqual(logs, []);

					reset.click();
					flushSync();
					assert.htmlEqual(output.innerHTML, '');
					assert.deepEqual(logs, []);
				}
			}

			const event = new window.MouseEvent('click', { bubbles: true });
			for (let i = 0; i < 2; i++) {
				section.dispatchEvent(event);
				flushSync();
				assert.htmlEqual(output.innerHTML, 'first, second');
				assert.deepEqual(logs, []);

				reset.click();
				flushSync();
			}
		} finally {
			for (const cleanup of cleanups) cleanup();
		}
	}
});
