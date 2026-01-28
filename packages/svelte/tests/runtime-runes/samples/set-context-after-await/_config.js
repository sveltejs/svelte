import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, logs }) {
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.ok(logs[0].startsWith('set_context_after_init'));
	}
});
