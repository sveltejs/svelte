import { tick } from 'svelte';
import { test } from '../../test';

// The aborted request's promise rejects only after B has finished. Cancellation
// must release A immediately without waiting for that user rejection, and B's
// continuation must observe its own coherent first and second values.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2, reject] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		a.click();
		await tick();
		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1', 'second 1']);

		b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 2']);

		first_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['second 2']);

		second_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);

		reject.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
