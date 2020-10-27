export default {
	props: {

	},
	html: `
		<button></button>
	`,

	async test({ assert, component, target, window}) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		const clicked = [];

		component.$on('clicked', event => {
			clicked.push(event.detail);
		});

		button.dispatchEvent(event);

		assert.equal(clicked.length, 1);
		assert.equal(clicked[0], 'info');
	}
};
