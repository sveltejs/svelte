import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>fork</button>
	<button>discard</button>
	<button>shift</button>
`;

// A fork creates a branch with an `await` expression inside a boundary that shows its pending snippet, and
// is discarded while the expression is pending. The branch is destroyed outside of a flush, which must
// still release the boundary: it resolves once the real world's work is done
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		fork.click();
		await tick();
		discard.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>pending</p>`);

		// 'slow'
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>slow</p>`);
	}
});
