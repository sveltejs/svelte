import { test } from '../../test';

export default test({
	async test({ assert }) {
		assert.deepEqual(document.documentElement.lang, 'de');
	}
});
