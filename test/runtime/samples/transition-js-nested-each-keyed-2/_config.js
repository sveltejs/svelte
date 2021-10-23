export default {
	props: {
		x: true,
		things: ['a', 'b']
	},

	test({ assert, component, target }) {
		component.x = false;
		assert.htmlEqual(target.innerHTML, '');
	}
};
