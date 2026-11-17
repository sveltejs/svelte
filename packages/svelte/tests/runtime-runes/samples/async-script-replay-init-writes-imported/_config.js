import { tick } from 'svelte';
import { test } from '../../test';

// An imported helper may synchronously write through its callback. That write
// belongs to this initialization attempt; it must not trigger a restart or be
// rejected as a derived/effect mutation merely because the helper is opaque.
export default test({
	mode: ['client'],
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

		// No user request resolves here. A self-write must not repeatedly enter the
		// initializer while its downstream request remains pending.
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
