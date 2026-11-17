import { tick } from 'svelte';
import { test } from '../../test';

// State and an ordinary snapshot are declared after the first await, not in the
// prefix. F initializes them from 1, but R must independently initialize from 2.
// R publishes first; its edited state and snapshot then become lifetime state.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, fork_first, real, real_first, real_last, fork_last, commit] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load first 1']);

		fork_first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['state 1/1', 'load last 1']);

		real.click();
		await tick();
		real_first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		real_last.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<button>edit local</button><p>2|2|2|2</p>');
		assert.deepEqual(logs.splice(0), ['load first 2', 'state 2/2', 'load last 2']);
		const [node] = output.querySelectorAll('p');
		const [edit] = output.querySelectorAll('button');

		edit.click();
		await tick();
		assert.equal(node.textContent, '2|2|3|2');
		assert.deepEqual(logs, []);

		fork_last.click();
		await tick();
		assert.equal(node.textContent, '2|2|3|2');
		commit.click();
		await tick();
		assert.equal(node.textContent, '1|2|3|1');
		assert.equal(output.querySelector('p'), node);
		assert.equal(output.querySelector('button'), edit);
		assert.deepEqual(logs, []);

		// The existing handler must still write R's established state, not F's
		// old post-await source or a newly reconstructed source.
		edit.click();
		await tick();
		assert.equal(node.textContent, '1|2|4|1');
		assert.deepEqual(logs, []);
	}
});
