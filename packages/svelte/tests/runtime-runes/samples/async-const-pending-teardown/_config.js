import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { dev: false },
	async test({ assert, target }) {
		await tick();
		const [run] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'pending: 0');

		run.click();
		await tick();
		await tick();
		await tick();

		assert.htmlEqual(output.innerHTML, 'pending: 0');
		assert.equal(target.querySelector('p'), null);
	}
});
