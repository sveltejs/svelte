import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		await Promise.resolve();
		assert.deepEqual(logs, [
			'button main',
			'div main 1',
			'div main 2',
			'document main',
			'document sub',
			'window main',
			'window sub'
		]);

		logs.length = 0;
		btn2?.click();
		await Promise.resolve();
		assert.deepEqual(logs, [
			'button sub',
			'document main',
			'document sub',
			'window main',
			'window sub'
		]);
	}
});
