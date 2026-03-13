import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	skip_no_async: true,
	async test({ assert, target }) {
		const button = /** @type {HTMLElement} */ (target.querySelector('button'));
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 0, count2: 0</p>`);
		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 1, count2: 1</p>`);
		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 2, count2: 1</p>`);
	}
});
