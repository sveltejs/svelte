import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		assert.deepEqual(logs.splice(0), ['count: 1']);

		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'count read label');
		assert.deepEqual(logs.splice(0).sort(), ['label: 1 items', 'read: 42']);
	}
});
