import { test } from '../../test';

export default test({
	get props() {
		return { n: 0 };
	},

	async test({ assert, component, logs }) {
		assert.deepEqual(logs, ['$effect.pre 0', 'another $effect.pre 1', 'render n0', 'render i1']);

		logs.length = 0;
		component.n += 1;

		assert.deepEqual(logs, ['$effect.pre 1', 'another $effect.pre 2', 'render n1', 'render i2']);
	}
});
