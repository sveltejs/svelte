import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [change] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>change name</button>
			<p>Hello name</p>
		`
		);

		change.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>change name</button>
			<p>Hello other</p>
		`
		);
	}
});
