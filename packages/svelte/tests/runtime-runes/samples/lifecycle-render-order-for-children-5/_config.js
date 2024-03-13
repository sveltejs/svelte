import { test } from '../../test';
import { log } from './log.js';

export default test({
	get props() {
		return { n: 0 };
	},

	before_test() {
		log.length = 0;
	},

	async test({ assert, component }) {
		assert.deepEqual(log, ['$effect.pre 0', 'another $effect.pre 1', 'render n0', 'render i1']);

		log.length = 0;
		component.n += 1;

		assert.deepEqual(log, ['$effect.pre 1', 'another $effect.pre 2', 'render n1', 'render i2']);
	}
});
