import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>page</button><button>filter</button><button>shift</button><button>pop eager</button>';

// The eager batch that re-runs `load` for the new `$state.eager(filter)` value intersects with the
// (pending) `page` batch, which ran `load`, too (see `Batch#intersects`). So it computes `load` with
// the new `page`, and is merged into the `page` batch — its result resolves that batch's `load(2, ...)`,
// and is shown next to `page: 2`. (If it computed `load` with the old `page`, it mustn't be merged)
export default test({
	// TODO test is fine, it results in a stable outcome, but we should have a dev time warning to not have $state.eager in async expressions
	async test({ assert, target }) {
		await tick();
		const [page, filter, shift, pop] = target.querySelectorAll('button');

		// B1: page = 2 -> load(2, 'a') pending
		page.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// filter = 'b' -> eager batch re-runs load(2, 'b'), pending
		filter.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 1</p><p>result: 1/a</p>`);

		// resolve load(2, 'b') -> the eager batch merges into B1, and both commit
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 2</p><p>result: 2/b</p>`);

		// resolve load(2, 'a') -> obsolete
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>page: 2</p><p>result: 2/b</p>`);
	}
});
