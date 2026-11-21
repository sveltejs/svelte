import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [toggle] = target.querySelectorAll('button');
		assert.deepEqual(logs.splice(0), ['start']);
		toggle.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['stop']);
	}
});
