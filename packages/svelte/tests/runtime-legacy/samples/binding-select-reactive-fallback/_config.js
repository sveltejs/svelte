import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<select>
			<option value="1">1</option>
			<option value="US">US</option>
			<option value="FR">FR</option>
		</select>
		<button id="btn-us">US</button>
		<button id="btn-reset">Reset</button>
		<button id="btn-fr">FR</button>
	`,

	async test({ assert, component, window, logs }) {
		// Primary assertion: No infinite loop error
		assert.notInclude(logs, 'Infinite loop detected');

		// Verify component state
		const select = window.document.querySelector('select');
		if (!select) {
			assert.fail('Select element not found');
			return;
		}

		// With default_details fallback nothing is selected
		assert.equal(select.value, '');
		assert.equal(select.disabled, false);

		window.document.getElementById('btn-us')?.click();
		await tick();
		assert.equal(select.disabled, true);
		assert.equal(select.value, 'US');

		window.document.getElementById('btn-reset')?.click();
		await tick();
		assert.equal(select.value, '');
		assert.equal(select.disabled, false);

		window.document.getElementById('btn-fr')?.click();
		await tick();
		assert.equal(select.value, 'FR');
		assert.equal(select.disabled, true);
	}
});
