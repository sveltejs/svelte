import { flushSync } from 'svelte';
import { test } from '../../test';
import { container } from './_renderer';

export default test({
	test({ assert, dispatch_event }) {
		// The local renderer retains non-string attribute values.
		/** @type {any[]} */
		const [toggle, option, field, defaults, spread, dynamic, button] = container.children.filter(
			(node) => node.type === 'element'
		);

		for (const value of [true, false, null, true, undefined, 0, '', 'truthy']) {
			const attributes =
				value == null
					? {}
					: { checked: value, selected: value, value, defaultValue: value, defaultChecked: value };
			assert.deepEqual(toggle.attributes, value == null ? {} : { checked: value });
			assert.deepEqual(option.attributes, value == null ? {} : { selected: value });
			assert.deepEqual(field.attributes, value == null ? {} : { value });
			assert.deepEqual(defaults.attributes, {
				value: 'fixed',
				checked: '',
				...(value == null ? {} : { defaultValue: value, defaultChecked: value })
			});
			assert.deepEqual(spread.attributes, attributes);
			assert.deepEqual(dynamic.attributes, attributes);

			dispatch_event(button, 'click');
			flushSync();
		}
	}
});
