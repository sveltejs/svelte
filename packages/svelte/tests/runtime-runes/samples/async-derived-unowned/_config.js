import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<p>2</p>
			`
		);

		button?.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>2</button>
				<p>4</p>
			`
		);
	}
});
