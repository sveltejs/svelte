import { test } from '../../test';

export default test({
	async test({ assert, logs, target, component }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		b1?.click();
		assert.deepEqual(logs, ['a']);

		b2?.click();
		b1?.click();

		b3?.click();
		b1?.click();

		assert.deepEqual(logs, ['a', 'b', 'a']);
	}
});
