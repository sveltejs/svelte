import { tick } from 'svelte';
import { test } from '../../test';

// F creates the shared script, then fails after G's first result is ready.
// The second await and template must continue in G's view: F has neither derived's value.
// Nothing renders until G commits.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork_f, fork_g, first_g, reject_f, second_g, commit_g, discard_f] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['created', 'load 1']);

		fork_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		// G has its value, but F still owns the script's initialization.
		first_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		// F's failure wakes the already-settled G result without restarting the script.
		reject_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 12']);

		second_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['continued 2 12']);

		commit_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/12</p>');
		assert.deepEqual(logs.splice(0), []);

		discard_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/12</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
