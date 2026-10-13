import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>page</button><button>filter</button><button>shift</button><button>pop</button>';

// The eager batch that re-runs `load` for the new `$state.eager(filter)` value computes it
// with the old `page`, because eager batches don't see other batches' changes. Therefore it
// must not be merged into the (pending) `page` batch — else its result would resolve that
// batch's `load(2, ...)` and be shown next to `page: 2`
export default test({
	async test({ assert, target }) {
		await tick();
		const [page, filter, shift, pop] = target.querySelectorAll('button');

		// B1: page = 2 -> load(2, 'a') pending
		page.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// filter = 'b' -> eager batch re-runs load(1, 'b'), pending
		filter.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// resolve load(1, 'b') -> the eager batch commits on its own
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/b</p>`);

		// resolve load(2, 'a') -> B1 commits (showing B1's own result is fine, as is
		// waiting for load(2, 'b'), as long as the result matches the page)
		shift.click();
		await tick();
		const [p1, p2] = target.querySelectorAll('p');
		assert.equal(p1.textContent, 'page: 2');
		assert.match(p2.textContent ?? '', /^result: 2\//);

		// load(2, 'b') resolves
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 2</p><p>result: 2/b</p>`);
	}
});
