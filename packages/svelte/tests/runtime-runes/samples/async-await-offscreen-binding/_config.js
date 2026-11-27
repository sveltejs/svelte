import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target }) {
		const [gate, second] = target.querySelectorAll('button');
		gate.click();
		await tick();

		// The binding writes in a different batch while its branch is offscreen.
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();

		second.click();
		await tick();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'second / false');

		const [details] = target.querySelectorAll('details');
		details.open = false;
		details.dispatchEvent(new Event('toggle'));
		await tick();
		assert.htmlEqual(output.innerHTML, 'second / true');
	}
});
