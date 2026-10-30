import { tick } from 'svelte';
import { test } from '../../test';

// A value assigned to a derived holds until one of its dependencies changes — also in the
// view of a batch that is rendered while another batch is pending
export default test({
	async test({ assert, target }) {
		const [other, assign, resolve] = target.querySelectorAll('button');

		resolve.click();
		await tick();

		// pending async work
		other.click();
		await tick();

		assign.click();
		await tick();

		const [, p] = target.querySelectorAll('p');
		assert.equal(p.textContent, '4');
	}
});
