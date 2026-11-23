import { tick } from 'svelte';
import { test } from '../../test';

// A real batch adopts a child created by a fork. If the fork's run rejects,
// the shared script must still continue with the real batch's successful result.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_fork, resolve_real, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), ['continued 2']);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
