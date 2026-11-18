import { tick } from 'svelte';
import { test } from '../../test';

// A handler's synchronous derived read aborts A while B is current. Committing
// an unrelated fork before B's traversal must not merge that fork into A.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, start, update_and_commit, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		start.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><span>0</span>');

		logs.length = 0;
		update_and_commit.click();
		// The handler has aborted A synchronously, before B gets its traversal.
		assert.deepEqual(logs.slice(0, 2), ['aborted 1,0', 'load 1,1']);
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><span>1</span>');

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>1</i><b>1</b><span>1</span>');
	}
});
