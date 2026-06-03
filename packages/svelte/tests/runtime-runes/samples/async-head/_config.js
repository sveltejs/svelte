import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, window }) {
		await tick();

		const head = window.document.head;

		// we don't care about the order, but we want to ensure that the
		// elements didn't clobber each other
		for (let n of ['1', '2', '3']) {
			const a = head.querySelector(`meta[name="a-${n}"]`);
			assert.equal(a?.getAttribute('content'), n);

			const b1 = head.querySelector(`meta[name="b-${n}-1"]`);
			assert.equal(b1?.getAttribute('content'), `${n}-1`);

			const b2 = head.querySelector(`meta[name="b-${n}-2"]`);
			assert.equal(b2?.getAttribute('content'), `${n}-2`);
		}
	}
});
