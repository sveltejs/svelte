import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// Batch A creates a branch with `{await ...}` in it, batch B (which doesn't share a source with A) reveals it,
// too. The content is created with A's result, in A's view, even though B's run is done first: B waits for
// that, and then re-validates the content in its own view. Before, B committed the branch without the content,
// as it didn't wait for it — only A did
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// B's run - at this point it realizes through the async derived that it is overlapping with A
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// ... which results in another rerun with `x=1`, hence two shifts until everything settled
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
	}
});
