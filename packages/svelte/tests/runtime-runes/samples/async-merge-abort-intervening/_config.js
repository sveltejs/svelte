import { settled, tick } from 'svelte';
import { test } from '../../test';

// Aborting the first batch's run must also merge an intervening batch. Its pending gate
// cannot hold up the latest view or any settled() promise once that view has committed.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [first, middle, last, value_2, gate_2, gate_1, value_1] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		first.click();
		const a = settled();
		await tick();
		middle.click();
		const b = settled();
		await tick();
		last.click();
		const c = settled();
		await tick();
		value_2.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);
		gate_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p><span>2</span> 0');
		await Promise.all([a, b, c]);
		gate_1.click();
		value_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p><span>2</span> 0');
		assert.deepEqual(logs, []);
	}
});
