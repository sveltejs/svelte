import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>show</button>
	<button>pop</button>
	<button>discard</button>
`;

// A fork creates a branch with `{await ...}` in it, and a real batch reveals it. The real batch's run aborts
// the fork's (they share the abort signal), which never settles. The real batch's result must still lead
// to the content being created and committed, rather than both waiting for the fork's run forever
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, show, pop, discard] = target.querySelectorAll('button');

		fork.click();
		await tick();
		show.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
	}
});
