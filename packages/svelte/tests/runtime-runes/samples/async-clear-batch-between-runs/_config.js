import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>x</button>
		<button>y</button>
		<p>loading...</p>
	`,

	async test({ assert, target }) {
		await tick();

		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		await tick();

		button2.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>x</button>
				<button>y</button>
				<p>x: x2</p>
				<p>y: y2</p>
			`
		);
	}
});
