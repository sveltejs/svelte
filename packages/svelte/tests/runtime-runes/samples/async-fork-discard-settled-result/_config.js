import { tick } from 'svelte';
import { first_batch } from '../../../../src/internal/client/reactivity/batch.js';
import { test } from '../../test';

// A fork's first result settles (and may start its dependent second request) before
// the fork is discarded. Neither a value nor an error may revive the discarded owner.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, real, fulfil, reject, discard, resolve_3, resolve_13, resolve_old, reset] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const settle of [fulfil, reject]) {
			fork.click();
			await tick();
			// Keep the owner to verify cleanup: stale private captures need not change the DOM.
			const batch = first_batch;
			assert.equal(batch?.is_fork, true);
			real.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 1', 'load 2']);

			settle.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			// The fork may speculatively start its second request, which discard then abandons
			assert.deepEqual(logs.splice(0), settle === fulfil ? ['load 11'] : []);

			discard.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 3']);
			assert.equal(batch?.linked, false);
			assert.equal(batch?.records, null);

			resolve_3.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 13']);

			resolve_13.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>3</b><p>3 13</p>');
			assert.deepEqual(logs.splice(0), ['continued 3 13']);

			resolve_old.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>3</b><p>3 13</p>');
			assert.deepEqual(logs.splice(0), []);

			reset.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), []);
		}
	}
});
