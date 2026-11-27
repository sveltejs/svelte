import { flushSync } from 'svelte';
import { vi } from 'vitest';
import { test } from '../../test';

export default test({
	test({ assert, target, mod, renderer, dispatch_event }) {
		const elements = target.children.filter((/** @type {any} */ n) => n.type === 'element');
		const button = elements.pop();
		const spread = elements[2];

		for (const element of elements) {
			assert.equal(element.attributes.fn, String(mod.functions[0]));
		}
		assert.notProperty(spread.attributes, 'onclick');
		assert.equal(spread.listeners.click.length, 1);

		const set_attribute = vi.spyOn(renderer, 'setAttribute');
		try {
			for (const fn of [mod.functions[1], undefined, mod.functions[0]]) {
				set_attribute.mockClear();
				dispatch_event(button, 'click');
				flushSync();

				for (const element of elements) {
					if (fn) {
						assert.equal(element.attributes.fn, String(fn));
						assert.ok(
							set_attribute.mock.calls.some(
								([node, key, value]) => node === element && key === 'fn' && value === fn
							)
						);
					} else {
						assert.notProperty(element.attributes, 'fn');
					}
				}
				assert.notProperty(spread.attributes, 'onclick');
				assert.equal(spread.listeners.click.length, fn ? 1 : 0);
			}
		} finally {
			set_attribute.mockRestore();
		}
	}
});
