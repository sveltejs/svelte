import { tick } from 'svelte';
import { create_deferred } from '../../../helpers';
import { test } from '../../test';

const deferred = create_deferred();

export default test({
	mode: ['client'],
	props: { promise: deferred.promise },
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: pending</p>');

		// Settling a promise after its boundary failed must not render another branch.
		deferred.resolve();
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: pending</p>');
	}
});
