import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: `
		<button>update</button> initial <p>initial</p>
	`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				initial
				<p>initial</p>
			`
		);

		const button = target.querySelector('button');
		button?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				updated
				<p>updated</p>
			`
		);
	}
});
