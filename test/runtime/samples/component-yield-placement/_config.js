export default {
	props: {
		showModal: true
	},

	html: `
		<div class='modal-background'></div>

		<div class='modal'>
			<h2>Hello!</h2>
			<button>close modal</button>
		</div>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.htmlEqual(target.innerHTML, `
			<button>show modal</button>
		`);
	}
};
