import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [toggle, resolve] = target.querySelectorAll('button');

		for (const pending of [true, false]) {
			if (!pending) {
				resolve.click();
				await tick();
			}

			logs.length = 0;
			toggle.click();
			await tick();
			const [output] = target.querySelectorAll('output');
			assert.htmlEqual(output.innerHTML, '6/6');
			assert.equal(logs.length, 6);

			logs.length = 0;
			const [, , increment] = target.querySelectorAll('button');
			increment.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '6/7');
			assert.equal(logs.length, 6);

			toggle.click();
			await tick();
		}
	}
});
