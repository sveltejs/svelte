import { tick } from 'svelte';
import { first_batch } from '../../../../src/internal/client/reactivity/batch.js';
import { test } from '../../test';

// Discard can race with an already-settled internal deferred whose result handler
// has not run yet. Neither a value nor an error may revive the discarded owner.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, real, fulfil_discard, reject_discard, resolve_3, resolve_13, resolve_old, reset] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const race of [fulfil_discard, reject_discard]) {
			fork.click();
			await tick();
			// Keep the owner to verify cleanup: stale private captures need not change the DOM.
			const batch = first_batch;
			assert.equal(batch?.is_fork, true);
			real.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 1', 'load 2']);

			race.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 3']);
			assert.equal(batch?.linked, false);
			assert.equal(batch?.prev, null);
			assert.equal(batch?.next, null);
			assert.equal(batch?.current.size, 0);
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
