import { test } from '../../test';

export default test({
	test({ assert, logs, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		b2?.click();
		b2?.click();
		b3?.click();
		b3?.click();

		b1?.click();

		b2?.click();
		b2?.click();
		b3?.click();
		b3?.click();

		assert.deepEqual(logs, [
			'creating handler (1)',
			1,
			2,
			'creating handler (1)',
			3,
			4,
			'creating handler (2)',
			6,
			8,
			'creating handler (2)',
			10,
			12
		]);
	}
});
