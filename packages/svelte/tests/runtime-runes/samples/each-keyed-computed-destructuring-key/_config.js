import { flushSync } from 'svelte';
import { ok, test } from '../../test';

// https://github.com/sveltejs/svelte/issues/18519
export default test({
	html: `
		<button>reverse</button>
		<p>1: a1</p>
		<p>2: a2</p>
		<p>3: a3</p>
	`,

	test({ assert, target }) {
		const btn = target.querySelector('button');
		ok(btn);

		flushSync(() => btn.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reverse</button>
				<p>3: a3</p>
				<p>2: a2</p>
				<p>1: a1</p>
			`
		);
	}
});
