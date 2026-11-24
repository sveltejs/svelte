import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, dispatch_event }) {
		const [toggle, toggle_spread, option, option_spread, field, field_spread, other, button] =
			target.children.filter((/** @type {any} */ n) => n.type === 'element');

		const values = () => [
			toggle.attributes.checked,
			toggle_spread.attributes.checked,
			option.attributes.selected,
			option_spread.attributes.selected,
			field.attributes.value,
			field_spread.attributes.value,
			other.attributes.enabled
		];

		// the test renderer stores `String(value)`, so `true` arrives as 'true' rather than ''
		assert.deepEqual(values(), ['true', 'true', 'true', 'true', 'hello', 'hello', 'true']);

		dispatch_event(button, 'click');
		flushSync();

		// `false` is passed through like any other value, `null` removes the attribute
		assert.deepEqual(values(), ['false', 'false', 'false', 'false', undefined, undefined, 'false']);
	}
});
