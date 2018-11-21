import result from './result.js';

export default {
	test(assert) {
		assert.deepEqual(result, [
			'onMount foo',
			'onMount bar'
		]);

		result.pop();
		result.pop();
	}
};
