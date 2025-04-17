import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<span>0</span>',

	async test({ assert, target }) {
		await Promise.resolve();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<span>1</span>`);
	}
});
