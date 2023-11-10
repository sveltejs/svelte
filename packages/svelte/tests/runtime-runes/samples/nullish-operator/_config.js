import { test } from '../../test';

export default test({
	get props() {
		return { log: [] };
	},

	async test({ assert, target, component }) {
		await Promise.resolve();
		await Promise.resolve();
		assert.deepEqual(component.log, ['a1: ', {}, 'b1: ', {}]);
	}
});
