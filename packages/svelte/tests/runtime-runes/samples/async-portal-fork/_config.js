import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	solo: true,
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, `<button>fork</button>`);

		btn?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<button>fork</button> <div>portaled</div> <div>portaled</div>`
		);
	}
});
