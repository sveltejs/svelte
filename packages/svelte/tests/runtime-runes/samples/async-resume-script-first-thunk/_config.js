import { tick } from 'svelte';
import { test } from '../../test';

// The first thunk, not just later ones, must hand `run` the batch that supplies its value.
// Keep that batch uncommitted so a continuation in the creator's view would read the old prop.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, value, gate, obsolete] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show.click();
		await tick();
		update.click();
		await tick();

		value.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);

		gate.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p><span>2</span>');

		obsolete.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p><span>2</span>');
		assert.deepEqual(logs, []);
	}
});
