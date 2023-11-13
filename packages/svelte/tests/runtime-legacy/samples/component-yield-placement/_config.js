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

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		await button?.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>show modal</button>
		`
		);
	}
});
