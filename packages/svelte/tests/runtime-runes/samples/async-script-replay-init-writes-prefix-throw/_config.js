import { tick } from 'svelte';
import { test } from '../../test';

// A synchronous factory/prologue failure occurs before any async thunk exists.
// It is cached privately, not replaced by an undefined-thunk error or retried on
// commit. There is no failed/onerror boundary: both commit calls must reject
// with the original Error, without modifying the independently published real DOM.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, real, resolve_real, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['init 1'], 'failed prefix must not invoke load(1)');

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['init 0', 'load 0']);

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		assert.deepEqual(logs.splice(0), []);
		const [node] = output.querySelectorAll('p');

		for (const count of [1, 2]) {
			commit.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<p>0</p>');
			assert.equal(output.querySelector('p'), node);
			assert.deepEqual(logs.splice(0), [`caught original ${count}`]);
		}
	}
});
