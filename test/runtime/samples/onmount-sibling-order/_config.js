import result from './result.js';

export default {
	// TODO is sibling onMount order important?
	skip: true,

	test({ assert }) {
		assert.deepEqual(result, [
			'onMount foo',
			'onMount bar'
		]);

		result.pop();
		result.pop();
	}
};
