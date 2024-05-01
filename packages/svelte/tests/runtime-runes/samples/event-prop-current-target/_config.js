import { test } from '../../test';

export default test({
	get props() {
		return { item: { name: 'Dominic' } };
	},

	async test({ assert, target, logs }) {
		const [s1] = target.querySelectorAll('span');

		s1?.click();
		await Promise.resolve();

		assert.deepEqual(logs, [false]);
	}
});
