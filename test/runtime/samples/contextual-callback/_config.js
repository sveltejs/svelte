export default {
	html: '<button>click me</button>',

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.equal(component.clicked, 'x');
	}
};
