import { test } from '../../test';

export default test({
	get props() {
		return { log: [] };
	},

	async test({ assert, target, component }) {
		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		await Promise.resolve();

		assert.deepEqual(component.log, ['first0', 'second0', 'first1', 'second1']);
	}
});
