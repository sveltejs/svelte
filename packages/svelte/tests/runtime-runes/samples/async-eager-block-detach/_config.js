import { tick } from 'svelte';
import { test } from '../../test';

// A branch that an eager block run deselects stays in the DOM until the batch that
// selects the new branch commits — just like the new branch is only appended then
export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [show, resolve] = target.querySelectorAll('button');
		const buttons = '<button>show</button><button>resolve</button>';

		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>false</p>`);

		show.click();
		await tick();

		// the branch with the `await` is still pending, so the current branch remains
		assert.htmlEqual(target.innerHTML, `${buttons}<p>false</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>true</p><p>shown</p>`);
	}
});
