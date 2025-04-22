import { test } from '../../test';

export default test({
	test({ assert, logs }) {
		assert.deepEqual(logs, ['bind:activeElement false', 'bind:value false']);
	}
});
