import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>x</button><button>toggle</button><button>pop</button>';

export default test({
	async test({ assert, target }) {
		await tick();
		const [x, toggle, pop] = target.querySelectorAll('button');

		// X is deferred on its own await
		x.click();
		await tick();
		// Y is deferred on the await inside the new branch
		toggle.click();
		await tick();
		// Z hides that branch again, merges into Y, which merges into X
		toggle.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>n = 0</p><p>x = 0</p>${buttons}`);

		// the branch's await resolves while it is hidden
		pop.click();
		await tick();
		// W shows the branch again and merges into X
		toggle.click();
		await tick();

		// nothing is pending any more, so X commits
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>n = 4</p><p>x = 1</p><p>cond: e</p>${buttons}`);
	}
});
