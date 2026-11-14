import { flushSync, settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [shift, add] = target.querySelectorAll('button');

		shift.click();
		await tick();

		const html = '<button>shift</button><button>add</button><p>0</p><span>1</span><span>2</span>';
		assert.htmlEqual(target.innerHTML, html);

		/** @type {Promise<void>} */
		let promise = Promise.resolve();

		// the batch has pending async work when the each block throws
		assert.throws(() => {
			flushSync(() => {
				add.click();
				promise = settled();
			});
		}, /each_key_duplicate/);

		let done = false;
		promise.then(() => (done = true));
		await tick();

		// the batch waits for its pending work
		assert.notOk(done);

		// resolving that work commits the batch without running the each block
		// again, which would throw a second time and discard the batch
		shift.click();
		await tick();
		assert.ok(done);
		assert.htmlEqual(target.innerHTML, html.replace('<p>0</p>', '<p>1</p>'));
	}
});
