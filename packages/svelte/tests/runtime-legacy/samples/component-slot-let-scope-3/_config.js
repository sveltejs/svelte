import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<div>
			<p>count in default slot: 0</p>
			<p slot="foo">count in foo slot: 0</p>
			<p slot="bar">count in bar slot: 42</p>
			<button>+1</button>
		</div>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<p>count in default slot: 1</p>
				<p slot="foo">count in foo slot: 1</p>
				<p slot="bar">count in bar slot: 42</p>
				<button>+1</button>
			</div>
		`
		);
	}
});
