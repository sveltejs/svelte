import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: `
		<div style="color: red;"></div>
		<div style="width: 100px;"></div>
		<button>width</button>
		<div style="color: red;"></div>
		<div style="width: 100px;"></div>
		<button>width</button>
	`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div style="color: red;"></div>
				<div style="width: 100px;"></div>
				<button>width</button>
				<div style="color: red;"></div>
				<div style="width: 100px;"></div>
				<button>width</button>
			`
		);
	}
});
