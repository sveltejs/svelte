import { tick } from 'svelte';
import { test } from '../../test';

// The real batch creates the shared child. A speculative error must not reject its
// script's initialization or invoke the real boundary's error handler.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, reject_fork, resolve_real, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 1']);

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 2']);

		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), []);

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p>');
		assert.deepEqual(logs.splice(0), ['continued 1']);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
