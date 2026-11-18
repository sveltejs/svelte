import { tick } from 'svelte';
import { test } from '../../test';

// Committing x discards both earlier forks, but must still rebase the following
// pending real batch. Unlinking a discarded batch must not terminate that traversal.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork_1, fork_2, start, update, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork_1.click();
		await tick();
		fork_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i>');
		assert.deepEqual(logs, []);

		start.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i>');
		assert.deepEqual(logs.splice(0), ['0/1']);

		update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>3</i>');
		assert.deepEqual(logs.splice(0), ['3/1']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>3</i><p>3/1</p>');
		assert.deepEqual(logs, []);
	}
});
