import { tick } from 'svelte';
import { test } from '../../test';

// F creates the shared script, while G's first result is already ready when F
// fails. That failure must wake G and transfer initialization to it, including
// the dependent second await. The template must also resume in G's view: F still
// has no values for either derived. Neither fork can render before G commits.
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
