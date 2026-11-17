import { tick } from 'svelte';
import { test } from '../../test';

// The function is supplied by a caller, so static local-helper inspection cannot
// decide whether it writes. Initialization must permit its synchronous callback
// without losing dependency tracking or repeatedly executing the write.
export default test({
	mode: ['client'],
	props: {
		/** @template T @param {() => T} callback */
		invoke: (callback) => callback()
	},
	async test({ assert, target, logs }) {
		const [resolve_a, resolve_b] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.deepEqual(logs.splice(0), ['before 0', 'load a 0']);
		assert.htmlEqual(output.innerHTML, 'pending');

		resolve_a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['write 1', 'load b 1']);
		assert.htmlEqual(output.innerHTML, 'pending');

		await tick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		assert.deepEqual(logs, []);

		resolve_b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '0 / 1 / 0 / 1 / 1');
		assert.deepEqual(logs, []);
	}
});
