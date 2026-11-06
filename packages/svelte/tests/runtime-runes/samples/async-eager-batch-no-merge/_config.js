import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>page</button><button>filter</button><button>shift</button><button>pop eager</button>';

// The eager batch that re-runs `load` for the new `$state.eager(filter)` value computes it
// with the old `page`, because eager batches don't see other batches' changes. Therefore it
// must not be merged into the (pending) `page` batch — else its result would resolve that
// batch's `load(2, ...)` and be shown next to `page: 2`
export default test({
	// TODO test is fine, it results in a stable outcome, but we should have a dev time warning to not have $state.eager in async expressions
	async test({ assert, target }) {
		await tick();
		const [page, filter, shift, pop] = target.querySelectorAll('button');

		// B1: page = 2 -> load(2, 'a') pending
		page.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// filter = 'b' -> eager batch re-runs load(1, 'b'), pending. B1 is independent of it, so it
		// keeps seeing filter 'a' (and its load(2, 'a')) for now
		filter.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// resolve load(1, 'b') -> the eager batch commits on its own. That changes B1's view, so B1
		// re-runs load(2, 'b')
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/b</p>`);

		// resolve load(2, 'a') -> obsolete, B1 doesn't commit yet because its own load(2, 'b') is still pending
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/b</p>`);

		// load(2, 'b') resolves
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 2</p><p>result: 2/b</p>`);
	}
});
