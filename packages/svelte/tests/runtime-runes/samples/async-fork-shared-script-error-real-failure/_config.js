import { tick } from 'svelte';
import { test } from '../../test';

// The fork creates the shared script, but the error belongs to the adopting real
// batch. It must reach the real boundary immediately, not wait for a fork commit.
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

		reject_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(logs.splice(0), ['onerror: request 2 failed']);

		// The valid speculative request can be discarded without another error.
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(logs.splice(0), []);

		// Its eventual settlement cannot continue the discarded script.
		resolve_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
