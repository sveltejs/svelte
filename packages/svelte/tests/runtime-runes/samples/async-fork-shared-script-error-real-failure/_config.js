import { tick } from 'svelte';
import { test } from '../../test';

// The fork creates the shared script, but the error belongs to the adopting real
// batch. It can wait for the fork to finish initialization, but must then reach
// the real boundary without committing the fork.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_real, discard, resolve_fork] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		// The real rejection waits while the fork still owns initialization.
		reject_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		// The script continues in the fork, then the real batch must show its error.
		resolve_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(logs.splice(0), ['continued 1', 'onerror: request 2 failed']);

		// Discarding the fork must not change the real boundary or report another error.
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
