import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, dispatch_event }) {
		// Find all inputs and the button
		const inputs = target.children.filter(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'input'
		);
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);

		assert.equal(inputs.length, 5);
		assert.ok(button);

		// Input 1: value="hello"
		const input_value = inputs[0];
		assert.equal(input_value.attributes['value'], 'hello');
		assert.equal(input_value.attributes['class'], 'hello');
		assert.equal(input_value.attributes['style'], 'color: blue');
		assert.equal(input_value.attributes['autofocus'], 'true');
		assert.equal(input_value.attributes['muted'], 'true');

		// Input 2: type="checkbox" checked=""
		const input_checked = inputs[1];
		assert.equal(input_checked.attributes['type'], 'checkbox');
		assert.equal(input_checked.attributes['checked'], '');

		// Input 3: value="fixed" defaultValue="default_val"
		const input_default_value = inputs[2];
		assert.equal(input_default_value.attributes['value'], 'fixed');
		assert.equal(input_default_value.attributes['defaultValue'], 'default_val');

		// Input 4: type="checkbox" checked="" defaultChecked=""
		const input_default_checked = inputs[3];
		assert.equal(input_default_checked.attributes['type'], 'checkbox');
		assert.equal(input_default_checked.attributes['checked'], '');
		assert.equal(input_default_checked.attributes['defaultChecked'], '');

		// Input 5: spread attributes
		const input_spread = inputs[4];
		assert.equal(input_spread.attributes['value'], 'hello');
		assert.equal(input_spread.attributes['class'], 'hello');
		assert.equal(input_spread.attributes['style'], 'color: blue');

		// Click the button to update all values
		dispatch_event(button, 'click');
		flushSync();

		// After update:
		// Input 1: value="world"
		assert.equal(input_value.attributes['value'], 'world');
		assert.equal(input_value.attributes['class'], 'world');
		assert.equal(input_value.attributes['style'], 'color: red');
		// Input 2: checked should be removed
		assert.equal(input_checked.attributes['checked'], undefined);

		// Input 3: defaultValue="new_default", value still "fixed"
		assert.equal(input_default_value.attributes['value'], 'fixed');
		assert.equal(input_default_value.attributes['defaultValue'], 'new_default');

		// Input 4: defaultChecked should be removed
		assert.equal(input_default_checked.attributes['defaultChecked'], undefined);

		// Input 5: spread attributes should update value to "world"
		assert.equal(input_spread.attributes['value'], 'world');
		assert.equal(input_spread.attributes['class'], 'world');
		assert.equal(input_spread.attributes['style'], 'color: red');
	}
});
