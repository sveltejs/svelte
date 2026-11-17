import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [increment, resolve_new, resolve_old] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.deepEqual(logs.splice(0), ['init 0', 'load 0']);
		increment.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['init 1', 'load 1']);
		resolve_new.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		resolve_old.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		assert.deepEqual(logs, []);
	}
});
