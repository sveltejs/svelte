import { test } from '../../test';

export default test({
	get props() {
		return { item: { name: 'Dominic' } };
	},

	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();

		assert.deepEqual(logs, ['Dominic']);
	}
});
