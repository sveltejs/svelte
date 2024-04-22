import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await new Promise((r) => setTimeout(r, 200)); // wait for await block to resolve

		const options = target.querySelectorAll('option');
		assert.ok(!options[0].selected);
		assert.ok(options[1].selected);
		assert.ok(!options[2].selected);
	}
});
