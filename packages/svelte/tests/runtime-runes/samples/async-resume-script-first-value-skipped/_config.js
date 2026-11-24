import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [start, update, hide, reject, resolve, finish] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		start.click();
		await tick();
		update.click();
		await tick();
		reject.click();
		await tick();

		// A skips the shared branch, but B still needs it. A's successful first value
		// must be observed before B publishes its buffered rejection.
		hide.click();
		await tick();
		resolve.click();
		await tick();
		assert.deepEqual(logs, [1]);

		finish.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p><p>failed: later</p>');
	}
});
