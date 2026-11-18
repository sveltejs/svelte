import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork_list, real_list, resolve_all, discard] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('main');

		resolve_all.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>0|0</s><s>1|1</s>');

		fork_list.click();
		real_list.click();
		discard.click();

		for (let i = 0; i < 5; i++) {
			await tick();
			resolve_all.click();
		}
		await tick();
		assert.htmlEqual(output.innerHTML, '<s>3|3</s><s>0|0</s><s>1|1</s>');
	}
});
