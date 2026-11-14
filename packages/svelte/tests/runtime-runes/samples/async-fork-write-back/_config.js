import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// batch-views: a write-back inside a fork (`x = 1; x = 0`) is lost: the second write equals the real value, so
	// `internal_set` doesn't count it as a change, and the fork keeps `x = 1` (same for the writable derived)
	async test({ assert, target }) {
		const [create, commit] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		create.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');

		commit.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0:0');
	}
});
