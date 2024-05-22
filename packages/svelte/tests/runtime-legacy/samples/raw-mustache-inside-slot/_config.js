import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>Switch</button>
		<p>Another first line</p>
		<p>This line should be last.</p>
	`,
	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		btn.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>First line</p>
				<p>This line should be last.</p>
			`
		);

		btn.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>Another first line</p>
				<p>This line should be last.</p>
			`
		);
	}
});
