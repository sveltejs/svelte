import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [btn] = target.querySelectorAll('button');

		btn.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>inc</button>
			<my-inner value="2"></my-inner>
			2
		`
		);
	}
});
