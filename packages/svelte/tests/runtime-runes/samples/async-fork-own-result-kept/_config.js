import { tick } from 'svelte';
import { test } from '../../test';

// A fork keeps the result of its own run of an async expression when a later batch, in whose view
// the expression read other values, commits first. The later batch doesn't change what the fork's
// run read (`s` is `true` in its view either way), so nothing makes the run happen again in its view
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, b, shift, commit] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>0 false</p>');

		fork.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>0 false</p>');

		b.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>0 true</p>');

		commit.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>1 true</p>');
	}
});
