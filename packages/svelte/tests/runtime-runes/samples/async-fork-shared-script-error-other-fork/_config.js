import { tick } from 'svelte';
import { test } from '../../test';

// F and G each execute the whole script, including its prefix, and G can start
// its second await before F fails. F's failure must not poison G's progress.
// Neither fork can render before G commits; prefix replay is not DOM installation.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork_f, fork_g, first_g, reject_f, second_g, commit_g, discard_f, late_replacement] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['created', 'load 1']);

		fork_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['created', 'load 2']);

		// G's dependent await can start without waiting for F's result.
		first_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 12']);

		// F's failure must not restart G or escape into the live boundary.
		reject_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		second_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['continued 2 12']);

		commit_g.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/12</p>');
		// G's commit writes x=2, genuinely superseding F's failed x=1 input.
		// F may initialize with that new input, but must not retry load(1).
		assert.deepEqual(logs.splice(0), ['load 2']);

		discard_f.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/12</p>');
		assert.deepEqual(logs.splice(0), []);

		late_replacement.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2/12</p>');
		assert.deepEqual(logs, [], 'discarded replacement must not start another await');
	}
});
