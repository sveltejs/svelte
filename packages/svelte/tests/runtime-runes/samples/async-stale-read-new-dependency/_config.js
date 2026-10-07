import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [update, show, resolve] = target.querySelectorAll('button');

		update.click();
		await tick();

		show.click();
		await tick();

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>update</button>
				<button>show</button>
				<button>resolve</button>
				<p>1</p>
			`
		);
	}
});
