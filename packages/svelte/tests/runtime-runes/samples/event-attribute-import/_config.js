import { test } from '../../test';
import { log, handler, log_a } from './event.js';

export default test({
	before_test() {
		log.length = 0;
		handler.value = log_a;
	},

	async test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1?.click();
		assert.deepEqual(log, ['a']);

		b2?.click();
		b1?.click();
		assert.deepEqual(log, ['a', 'b']);
	}
});
