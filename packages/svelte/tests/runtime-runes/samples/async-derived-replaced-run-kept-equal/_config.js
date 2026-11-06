import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>increment</button><button>shift</button>';
const blocks = '<span>plain</span><span>signal</span>';

// Three batches write `n`. Each evaluates the deriveds of the `{#if}` blocks in its view,
// which executes deriveds. Those deriveds should not rerun when resolving the promises.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [increment, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>${blocks}`);
		assert.deepEqual(logs.splice(0), ['plain 0', 'signal 0']);

		increment.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['plain 1', 'aborted 0', 'signal 1']);

		increment.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['plain 2', 'aborted 1', 'signal 2']);

		increment.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['plain 3', 'aborted 2', 'signal 3']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>${blocks}`);

		for (const n of [1, 2, 3]) {
			shift.click();
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}<p>${n}</p>${blocks}`);
			assert.deepEqual(logs.splice(0), []);
		}
	}
});
