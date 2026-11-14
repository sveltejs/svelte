import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>change</button><button>resolve</button>';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [change, resolve] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons}<p>loading</p>`);

		// The first traversal hides the unresolved branch and queues a reveal. Updating
		// the each item's source schedules another traversal that restores the branch.
		change.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>loading</p>`);

		resolve.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>ready</p>`);
	}
});
