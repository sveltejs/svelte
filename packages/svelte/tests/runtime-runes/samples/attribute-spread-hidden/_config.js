import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		const div = target.querySelector('div');
		const btn = target.querySelector('button');

		assert.equal(div?.hidden, true);

		await btn?.click();
		assert.equal(div?.hidden, false);
	}
});
