import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { showModal: true };
	},

	html: `
		<div class='modal-background'></div>

		<div class='modal'>
			<h2>Hello!</h2>
			<button>close modal</button>
		</div>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		button?.dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>show modal</button>
		`
		);
	}
});
