import { flushSync } from 'svelte';
import { test } from '../../test';
import { root } from './_renderer';

const names = ['checked', 'selected', 'value', 'defaultValue', 'defaultChecked'];

export default test({
	test({ assert, dispatch_event }) {
		/** @type {any[]} */
		const elements = root.children.filter((/** @type {any} */ n) => n.type === 'element');
		const button = /** @type {any} */ (elements.pop());

		for (const v of [true, false, 0, '', 'hello', null, true, undefined]) {
			const own = v == null ? undefined : v;

			assert.deepEqual(
				elements.slice(0, 5).map((el, i) => el.attributes[names[i]]),
				[own, own, own, own, own],
				`direct, ${JSON.stringify(v)}`
			);

			for (const el of elements.slice(5)) {
				assert.deepEqual(
					el.attributes,
					v == null ? {} : Object.fromEntries(names.map((name) => [name, v])),
					`<${el.name}>, ${JSON.stringify(v)}`
				);
			}

			dispatch_event(button, 'click');
			flushSync();
		}
	}
});
