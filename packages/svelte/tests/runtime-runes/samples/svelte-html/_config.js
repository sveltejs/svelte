import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.deepEqual(document.documentElement.lang, 'de');

		target.querySelector('button')?.click();
		assert.deepEqual(logs, ['clicked']);
	}
});
