import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A boundary shows its pending snippet because of an `await` expression inside an `{#if}` branch. A fork
// hides that branch, so nothing inside the boundary holds up the fork — but that's only true in the fork's
// view of the world. Until the fork is committed the branch still exists and its `await` is still pending,
// so the boundary must keep showing its pending snippet rather than reveal its (unresolved) content
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		fork.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>before</p> <p>resolved</p>`);
	}
});
