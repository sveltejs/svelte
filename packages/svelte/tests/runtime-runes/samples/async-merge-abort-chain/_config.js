import { tick } from 'svelte';
import { test } from '../../test';

// Successive aborts merge all three batches before their results arrive. Only the latest
// results may resume the scripts; abandoned promises must not hold up the pending count.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, , value_3, other_3, gate_3, value_1, value_2, other_2, gate_2] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show.click();
		await tick();
		update.click();
		await tick();
		update.click();
		await tick();

		value_3.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued value with 3 3']);
		other_3.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued other with 3 3']);
		assert.equal(output.querySelector('p'), null);

		gate_3.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>value: 3 3</p><p>other: 3 3</p><span>3</span> 0');

		value_1.click();
		value_2.click();
		other_2.click();
		gate_2.click();
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(output.innerHTML, '<p>value: 3 3</p><p>other: 3 3</p><span>3</span> 0');
	}
});
