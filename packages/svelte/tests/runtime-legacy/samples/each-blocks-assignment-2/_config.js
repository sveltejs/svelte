import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<span class="content">foo</span>
		<button>Test</button>
	`,
	test({ assert, target, window }) {
		const button = target.querySelector('button');

		const clickEvent = new window.MouseEvent('click', { bubbles: true });
		button?.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span class="content">bar</span>
			<button>Test</button>
		`
		);
	}
});
