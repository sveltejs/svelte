import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, resolve, reject] = target.querySelectorAll('button');

		increment.click();
		await tick();

		reject.click();
		await tick();

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>resolve</button>
				<button>reject</button>
				<p>false</p>
				<p>1</p>
			`
		);
	},

	expect_unhandled_rejections: true
});
