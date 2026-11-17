import { tick } from 'svelte';
import { test } from '../../test';

// The state and its ordinary snapshot are created in the continuation group.
// Its synchronous SELFWRITE belongs to that same initializer: it must not reset
// the factory, replay the first await, or repeat the increment while value waits.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [start, value] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['prefix', 'load start 0']);

		start.click();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending');
		assert.deepEqual(logs.splice(0), ['write 1', 'load value 1']);

		await tick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		assert.deepEqual(logs, [], 'own late-state write must not replay initialization');

		value.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0|1|1</p>');
		assert.deepEqual(logs, []);
	}
});
