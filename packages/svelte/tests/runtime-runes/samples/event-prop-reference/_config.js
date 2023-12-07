import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	get props() {
		return { item: { name: 'Dominic' } };
	},

	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');

		b1?.click();
		await Promise.resolve();

		assert.deepEqual(log, ['Dominic']);
	}
});
