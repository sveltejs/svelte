import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>
			<p>a</p>
		</div>
	`,

	test({ assert, target, window }) {
		const div = target.querySelector('div');
		const click = new window.MouseEvent('click', { bubbles: true });

		div?.dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<p>b</p>
			</div>
		`
		);
	}
});
