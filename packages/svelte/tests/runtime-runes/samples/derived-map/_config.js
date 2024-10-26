import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `Loading`,
	compileOptions: {
		// dev: true
	},

	async test({ assert, target }) {
		await Promise.resolve();
		flushSync();

		assert.htmlEqual(target.innerHTML, `1`);
	}
});
