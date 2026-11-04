import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	server_props: { browser: false },
	props: { browser: true },

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>failed: client error</p><section><span>after</span></section>'
		);
	}
});
