import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	async test({ assert, target }) {
		const e = target.querySelector('#else-branch');

		assert.equal(e?.isConnected, true);

		await tick();

		assert.equal(e?.isConnected, true);
		assert.htmlEqual(target.innerHTML, '<p id="else-branch">else branch</p>');
	}
});
