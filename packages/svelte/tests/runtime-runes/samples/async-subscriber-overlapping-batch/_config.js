import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		await tick();

		const [output] = target.querySelectorAll('output');
		const [next_btn, resolve_btn] = target.querySelectorAll('button');

		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), ['start 1', 'load 1']);

		// While load(2) is pending, committed subscription 1 must remain active and not loop.
		next_btn.click();
		await tick();
		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), ['start 2', 'load 2']);

		// Once load(2) resolves and commits, subscription 1 is torn down.
		resolve_btn.click();
		await tick();
		assert.equal(output.textContent, '2');
		assert.deepEqual(logs.splice(0), ['stop 1']);
	}
});
