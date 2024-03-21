import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await target.querySelector('button')?.click();
		await Promise.resolve();

		const options = target.querySelectorAll('option');
		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
		assert.equal(options[2].selected, false);
		assert.equal(options[3].selected, false);
		assert.equal(options[4].selected, true);
		assert.equal(options[5].selected, false);
	}
});
