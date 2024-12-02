import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
  <button>Add entry</button>
  <p>x</p>
`,

	test({ assert, target, window }) {
		const clickEvent = new window.Event('click', { bubbles: true });

		target.querySelector('button')?.dispatchEvent(clickEvent);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
    <button>Add entry</button>
    <p>x</p>
    <p>y</p>
    <button>Remove entry</button>
    `
		);

		target.querySelectorAll('button')[1].dispatchEvent(clickEvent);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
    <button>Add entry</button>
    <p>x</p>
    `
		);
	}
});
