import { test } from '../../test';

export default test({
	async test({ assert, target, logs, variant }) {
		const [b1, b2, b3, b4] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();
		b2.click();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		b3.click();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		b4.click();
		await Promise.resolve();
		await Promise.resolve();
		assert.deepEqual(
			logs,
			variant === 'hydrate' ? ['pending', 'a', 'b', 'c', 'pending'] : ['a', 'b', 'c', 'pending']
		);
	}
});
