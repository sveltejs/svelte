import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },
	async test({ assert, target, warnings }) {
		await tick();
		const [increment] = target.querySelectorAll('button');

		increment.click();
		await new Promise((resolve) => setTimeout(resolve, 10));
		assert.htmlEqual(target.innerHTML, '<button>increment</button> 1 1');
		assert.deepEqual(warnings, []);
	}
});
