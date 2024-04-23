import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, logs }) {
		assert.deepEqual(logs, ['init']);
	}
});
