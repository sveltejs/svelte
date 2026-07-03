import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [show, resolve] = target.querySelectorAll('button');

		show.click();
		await tick();
		// the batch is blocked on the portal content's async work — nothing
		// (including the synchronous parts of the portal content) may appear yet
		assert.htmlEqual(target.innerHTML, `<button>show</button> <button>resolve</button> false`);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>show</button> <button>resolve</button> <h1>static</h1> async true`
		);
	}
});
