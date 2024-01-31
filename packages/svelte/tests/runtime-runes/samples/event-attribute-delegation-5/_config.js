import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		await Promise.resolve();
		assert.deepEqual(log, [
			'button onclick',
			'button on:click',
			'inner div on:click',
			'outer div onclick'
		]);
	}
});
