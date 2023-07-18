export default {
	get props() {
		return { x: true, things: ['a', 'b'] };
	},

	test({ assert, component, target }) {
		component.x = false;
		assert.htmlEqual(target.innerHTML, '');
	}
};
