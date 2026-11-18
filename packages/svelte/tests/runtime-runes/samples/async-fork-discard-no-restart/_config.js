import { tick } from 'svelte';
import { test } from '../../test';

// Discarding an unresolved fork must stop it from starting more speculative work
// when a later real batch commits. This does not depend on an abort signal.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, discard, update, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '<p>0/0</p>');
		assert.deepEqual(logs.splice(0), ['0/0']);

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0</p>');
		assert.deepEqual(logs.splice(0), ['1/0']);

		// Leave 1/0 unresolved, even after discarding its fork.
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0</p>');
		assert.deepEqual(logs.splice(0), []);

		update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0</p>');
		assert.deepEqual(logs.splice(0), ['0/1']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/1</p>');
		assert.deepEqual(logs, []);
	}
});
