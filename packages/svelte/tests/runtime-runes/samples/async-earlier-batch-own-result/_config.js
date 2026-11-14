import { tick } from 'svelte';
import { test } from '../../test';

// A later batch that writes a value an earlier batch's async expression may read intersects with it
// (see `Batch#intersects`): its view includes the earlier batch's writes. Here, the expression doesn't
// read the later batch's write in that view, so it doesn't run again, and the later batch commits
// together with the earlier one, with its result
export default test({
	async test({ assert, target }) {
		const [flag, d, d1, d2, x10] = target.querySelectorAll('button');

		d1.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>d1</p>');

		// pending: the expression reads `flag` and `x`
		flag.click();
		await tick();

		// in this batch's view, `flag` is false, so the expression doesn't read `d` (and doesn't run again).
		// This batch has no pending work of its own, so it merges into the earlier one
		d.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>d1</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>true 1</span>');

		// (no such run)
		d2.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>d1</p>');

		x10.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>x10</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>false 2</span>');
	}
});
