import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const p = target.querySelector('p');
		assert.equal(p?.innerHTML, '1');
		assert.deepEqual(logs, [0]);
	}
});
