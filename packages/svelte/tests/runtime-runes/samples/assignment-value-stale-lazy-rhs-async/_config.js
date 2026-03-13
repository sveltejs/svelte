import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, target }) {
		const button = /** @type {HTMLElement} */ (target.querySelector('button'));
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 0, count2: 0</p>`);

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 1, count2: 1</p>`);

		// additional tick necessary in legacy mode because it's using Promise.resolve() which finishes before the await in the component,
		// causing the cache to not be set yet, which would result in count2 becoming 2
		await tick();

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<button>go</button><p>count1: 2, count2: 1</p>`);
	}
});
