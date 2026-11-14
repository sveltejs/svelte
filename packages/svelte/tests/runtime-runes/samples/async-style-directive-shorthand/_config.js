import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: `
		<div style="color: red;"></div>
		<div style="color: red;"></div>
	`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div style="color: red;"></div>
				<div style="color: red;"></div>
			`
		);
	}
});
