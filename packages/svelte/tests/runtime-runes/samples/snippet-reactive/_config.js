import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>foo</p>
		<button>show bar</button>
	`,

	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>bar</p>
				<button>show bar</button>
			`
		);
	}
});
