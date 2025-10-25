import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async: true,
	async test(assert, target) {
		assert.htmlEqual(target.innerHTML, 'component: loaded, boundary: loading');
		await tick();
		assert.htmlEqual(target.innerHTML, 'component: loaded, boundary: loaded');
	}
});
