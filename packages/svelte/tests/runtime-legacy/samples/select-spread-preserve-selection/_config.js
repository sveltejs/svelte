import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		ok(select);

		assert.equal(select.selectedIndex, 0);

		component.toggle();
		flushSync();
		await Promise.resolve();

		assert.equal(select.selectedIndex, 0);

		component.toggle();
		flushSync();
		await Promise.resolve();

		assert.equal(select.selectedIndex, 0);
	}
});
