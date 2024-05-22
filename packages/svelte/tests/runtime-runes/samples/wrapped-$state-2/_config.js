import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
  <button>foo</button>
`,

	test({ assert, target, window }) {
		const clickEvent = new window.Event('click', { bubbles: true });
		target.querySelector('button')?.dispatchEvent(clickEvent);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
      <button>bar</button>
    `
		);
	}
});
