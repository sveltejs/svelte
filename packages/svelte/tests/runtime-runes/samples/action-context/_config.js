import { ok, test } from '../../test';
import { flushSync, tick } from 'svelte';
import { log } from './log.js';

export default test({
	html: `<button>0</button>`,

	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		ok(btn);

		flushSync(() => btn.click());
		assert.deepEqual(log, ['update', 0, 1]);

		flushSync(() => btn.click());
		assert.deepEqual(log, ['update', 0, 1, 'destroy', 1]);
	}
});
