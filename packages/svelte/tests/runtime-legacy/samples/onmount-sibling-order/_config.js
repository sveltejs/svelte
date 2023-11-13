import { test } from '../../test';
import result from './result.js';

export default test({
	test({ assert }) {
		assert.deepEqual(result, ['onMount foo', 'onMount bar']);

		result.pop();
		result.pop();
	}
});
