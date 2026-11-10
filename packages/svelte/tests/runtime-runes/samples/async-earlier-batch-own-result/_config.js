import { tick } from 'svelte';
import { test } from '../../test';

// An earlier batch keeps the result of its own run of an async expression when a later batch,
// in whose view the expression read other values, commits first
export default test({
	async test({ assert, target }) {
		const [flag, d, d1, d2, x10] = target.querySelectorAll('button');

		d1.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>d1</p>');

		// pending: the expression reads `flag` and `x`
		flag.click();
		await tick();

		// pending: in this batch's view, `flag` is still true, so the expression reads `d`
		d.click();
		await tick();

		d2.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>d2</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>true 2</span>');

		x10.click();
		await tick();
		assert.htmlEqual(target.querySelector('p')?.outerHTML ?? '', '<p>x10</p>');
		assert.htmlEqual(target.querySelector('span')?.outerHTML ?? '', '<span>false 2</span>');
	}
});
