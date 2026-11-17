import { tick } from 'svelte';
import { test } from '../../test';

// Replacing a pending boundary's run must resume its script in the merged view,
// even while a sibling await still prevents the batch from committing.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, value, gate] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>pending</i>');
		update.click();
		await tick();
		value.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued value with 2 2']);
		gate.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>value: 2 2</p><span>2</span>');
	}
});
