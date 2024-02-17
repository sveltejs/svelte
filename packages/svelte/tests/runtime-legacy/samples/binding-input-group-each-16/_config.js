import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const checkboxes = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input[type="checkbox"]')
		);

		assert.isFalse(checkboxes[0].checked);
		assert.isTrue(checkboxes[1].checked);
		assert.isFalse(checkboxes[2].checked);

		await checkboxes[1].click();

		const noChecked = target.querySelector('#output')?.innerHTML;
		assert.equal(noChecked, '');

		await checkboxes[1].click();

		const oneChecked = target.querySelector('#output')?.innerHTML;
		assert.equal(oneChecked, 'Mint choc chip');
	}
});
