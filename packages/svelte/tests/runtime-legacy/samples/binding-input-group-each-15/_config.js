import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const checkboxes = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input[type="checkbox"]')
		);

		assert.isFalse(checkboxes[0].checked);
		assert.isTrue(checkboxes[1].checked);
		assert.isFalse(checkboxes[2].checked);

		checkboxes[1].click();
		flushSync();

		const noChecked = target.querySelector('#output')?.innerHTML;
		assert.equal(noChecked, '');

		checkboxes[1].click();
		flushSync();

		const oneChecked = target.querySelector('#output')?.innerHTML;
		assert.equal(oneChecked, 'Mint choc chip');
	}
});
