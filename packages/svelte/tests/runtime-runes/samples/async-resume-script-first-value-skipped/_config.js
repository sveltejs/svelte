import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [start, update, hide, reject, resolve, finish] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		start.click();
		await tick();
		update.click();
		await tick();
		reject.click();
		await tick();

		// B is merged into A, which means `value` throws and the error boundary appears
		assert.deepEqual(logs, []);
		assert.htmlEqual(output.innerHTML, '<p>0</p><p>failed: later</p>');

		finish.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p><p>failed: later</p>');
	}
});
