import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');
		btn.click();
		await Promise.resolve();

		assert.deepEqual(logs, ['init', {}, 'init', [], 'update', { x: 'hello' }, 'update', ['hello']]);
	}
});
