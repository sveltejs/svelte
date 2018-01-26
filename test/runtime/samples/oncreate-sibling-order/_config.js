import result from './result.js';

export default {
	test(assert) {
		assert.deepEqual(result, [
			'oncreate foo',
			'oncreate bar'
		]);

		result.pop();
		result.pop();
	}
};
