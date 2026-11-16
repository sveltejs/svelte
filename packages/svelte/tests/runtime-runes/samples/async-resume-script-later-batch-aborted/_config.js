import { tick } from 'svelte';
import { test } from '../../test';

// Both expressions request abort signals. B supersedes A's pending work, then
// initializes from its own first and second results. It must not wait for A's
// aborted second result or combine A's first value with B's second value.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, second_1, first_2, second_2] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		a.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 1']);

		first_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['second 1']);

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

		second_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
