import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '0 a b');
		assert.deepEqual(logs, ['a', 'b', 'micro a', 'micro b']);
	}
});
