import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
  <p>1 4 0</p>
  <button>Shouldn't be reactive</button>
  `,

	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
  			<p>1 4 0</p>
  			<button>Shouldn't be reactive</button>
  			`
		);
	}
});
