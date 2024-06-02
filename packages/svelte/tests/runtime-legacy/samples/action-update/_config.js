import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>action</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const enter = new window.MouseEvent('mouseenter');
		const leave = new window.MouseEvent('mouseleave');
		const ctrlPress = new window.KeyboardEvent('keydown', { ctrlKey: true });

		button.dispatchEvent(enter);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an Action</div>
		`
		);

		window.dispatchEvent(ctrlPress);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an augmented Action</div>
		`
		);

		button.dispatchEvent(leave);
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
		`
		);
	}
});
