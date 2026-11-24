import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	test({ assert, target }) {
		const [open] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '0:false');

		for (let i = 1; i <= 2; i++) {
			open.click();
			flushSync();
			assert.htmlEqual(output.innerHTML, `${i - 1}:true`);

			const [, action] = target.querySelectorAll('button');
			action.click();
			flushSync();
			assert.htmlEqual(output.innerHTML, `${i}:false`);
			assert.equal(target.querySelector('[role="dialog"]'), null);
		}
	}
});
