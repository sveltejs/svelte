export default {
	get props() {
		return { foo: [1], a: 42 };
	},

	html: `
		<button>click me</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		button.dispatchEvent(event);
		assert.equal(component.snapshot, 42);
	}
};
