import { tick } from 'svelte';
import { test } from '../../test';

// A block's selection in an earlier batch survives a later batch committing a different
// selection first, if the earlier batch's view of what the block reads doesn't change
export default test({
	async test({ assert, target }) {
		const [flag, a, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>yes</span>');

		// pending: selects `no` (the block reads `flag` and `b`)
		flag.click();
		await tick();

		// selects `yes` (in this batch's view, `flag` is still true, so the block reads `a`) and commits
		a.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>true</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>yes</span>');

		resolve.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>false</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>no</span>');
	}
});
