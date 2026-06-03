import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clear</button>
				<p></p>
			`
		);
	}
});
