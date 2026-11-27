import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, dispatch_event }) {
		const inputs = target.children.filter(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'input'
		);
		const button = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'button'
		);
		const select = target.children.find(
			(/** @type {any} */ n) => n.type === 'element' && n.name === 'select'
		);
		const selected_option = select.children.find(
			(/** @type {any} */ n) =>
				n.type === 'element' && n.name === 'option' && n.attributes['value'] === 'other'
		);

		assert.equal(inputs.length, 4);
		assert.ok(button);
		assert.ok(select);
		assert.ok(selected_option);

		// Input 1: direct defaultValue attribute
		const input_direct_val = inputs[0];
		// Input 2: defaultValue via spread
		const input_spread_val = inputs[1];
		// Input 3: direct defaultChecked attribute (with `checked` alongside for consistent codegen)
		const input_direct_chk = inputs[2];
		// Input 4: defaultChecked via spread
		const input_spread_chk = inputs[3];

		// --- Initial state ---

		// Direct defaultValue should appear as a renderer attribute
		assert.equal(input_direct_val.attributes['value'], 'fixed');
		assert.equal(input_direct_val.attributes['defaultValue'], 'default_val');

		// Spread defaultValue should produce the SAME result as direct defaultValue.
		// BUG: without fix, spread bypasses the renderer and writes element.defaultValue directly
		// so the attribute won't exist on the object-based renderer node
		assert.equal(input_spread_val.attributes['value'], 'fixed');
		assert.equal(
			input_spread_val.attributes['defaultValue'],
			'default_val',
			'defaultValue via spread should go through renderer.setAttribute, not element.defaultValue'
		);

		// Direct defaultChecked should appear as a renderer attribute
		assert.equal(input_direct_chk.attributes['type'], 'checkbox');
		assert.equal(input_direct_chk.attributes['checked'], '');
		assert.equal(input_direct_chk.attributes['defaultChecked'], 'true');

		// Spread defaultChecked should also go through the renderer API.
		// The shared test renderer stores the passed-through boolean as a string.
		assert.equal(input_spread_chk.attributes['type'], 'checkbox');
		assert.equal(
			input_spread_chk.attributes['defaultChecked'],
			'true',
			'defaultChecked via spread should go through renderer.setAttribute, not element.defaultChecked'
		);

		assert.equal(select.attributes['defaultValue'], 'default_val');
		assert.equal(selected_option.attributes['selected'], 'true');

		// --- After update ---
		dispatch_event(button, 'click');
		flushSync();

		// Direct defaultValue should update
		assert.equal(input_direct_val.attributes['defaultValue'], 'new_default');

		// Spread defaultValue should also update via renderer
		assert.equal(
			input_spread_val.attributes['defaultValue'],
			'new_default',
			'updated defaultValue via spread should go through renderer.setAttribute'
		);

		// Direct defaultChecked should retain false
		assert.equal(input_direct_chk.attributes['defaultChecked'], 'false');

		// Spread defaultChecked should also pass false to the renderer
		assert.equal(
			input_spread_chk.attributes['defaultChecked'],
			'false',
			'updated defaultChecked=false via spread should go through renderer.setAttribute'
		);

		assert.equal(select.attributes['defaultValue'], 'new_default');
		assert.equal(selected_option.attributes['selected'], 'false');
	}
});
