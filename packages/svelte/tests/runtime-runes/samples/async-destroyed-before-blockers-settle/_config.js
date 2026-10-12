import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [hide, resolve] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>hide</button>
				<button>resolve</button>
				<p>loading...</p>
			`
		);

		hide.click();
		await tick();

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>hide</button>
				<button>resolve</button>
			`
		);
	}
});
