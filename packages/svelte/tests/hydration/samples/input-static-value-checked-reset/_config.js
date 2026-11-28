import { test } from '../../test';

export default test({
	async test(assert, target) {
		const [checkbox, radio_a, radio_b] = target.querySelectorAll('input');
		const [reset] = target.querySelectorAll('button');

		await Promise.resolve();
		assert.deepEqual([checkbox.value, radio_a.value, radio_b.value], ['yes', 'a', 'b']);
		// The static `checked` attribute is the default, and survives hydration
		assert.deepEqual(
			[checkbox.defaultChecked, radio_a.defaultChecked, radio_b.defaultChecked],
			[true, true, false]
		);

		checkbox.checked = false;
		radio_b.checked = true;

		reset.click();
		await Promise.resolve();

		// A form reset restores the initial selection
		assert.deepEqual([checkbox.checked, radio_a.checked, radio_b.checked], [true, true, false]);
	}
});
