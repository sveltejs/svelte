import { test } from '../../test';

export default test({
	async test({ assert, errors }) {
		assert.deepEqual(errors, []);
	}
});
