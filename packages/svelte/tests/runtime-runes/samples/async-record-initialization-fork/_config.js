import { tick } from 'svelte';
import { test } from '../../test';

// The fork's first async producer starts after its own raw await, and stays
// private when the real view starts an independent initializer. Real publication
// establishes snapshot=0; a later fork commit can update the reactive value, but
// must not replace the established snapshot with the fork's private snapshot=1.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, hide, begin, resolve_0, resolve_1, commit, discard] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const finish of [discard, commit]) {
			fork.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), []);

			begin.click();
			await tick();
			assert.deepEqual(logs.splice(0), ['load 1']);

			show.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), []);

			// The real attempt has its own pending raw await, not the fork's
			// already-completed first checkpoint. Adopting must not abort load(1).
			begin.click();
			await tick();
			assert.deepEqual(logs.splice(0), ['load 0']);

			resolve_0.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b><p>0 0</p>');
			assert.deepEqual(logs.splice(0), ['continued 0 0']);
			const [node] = output.querySelectorAll('p');

			resolve_1.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b><p>0 0</p>');
			assert.deepEqual(logs.splice(0), ['continued 1 1']);

			finish.click();
			await tick();
			assert.equal(output.querySelector('p'), node);

			if (finish === discard) {
				assert.htmlEqual(output.innerHTML, '<b>0</b><p>0 0</p>');
				assert.deepEqual(logs.splice(0), ['abort 1']);

				hide.click();
				await tick();
				assert.htmlEqual(output.innerHTML, '<b>0</b>');
				assert.deepEqual(logs.splice(0), ['abort 0']);
			} else {
				assert.htmlEqual(output.innerHTML, '<b>1</b><p>1 0</p>');
				assert.deepEqual(logs.splice(0), ['abort 0']);
			}
		}
	}
});
