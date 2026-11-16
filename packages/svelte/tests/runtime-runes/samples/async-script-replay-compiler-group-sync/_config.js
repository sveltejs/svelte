import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, logs }) {
		await tick();
		await settled();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'done');
		assert.deepEqual(logs, ['one', 'two', 'microtask one', 'microtask two']);
	}
});
