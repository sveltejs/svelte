import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick(); // settle initial await

		const checkBox = target.querySelector('input');

		checkBox?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<input type="checkbox"/>
				<p>true</p>
			`
		);
	}
});
