export default {
	props: {
		items: []
	},

	html: '',

	test({ assert, component, target }) {
		component.items = ['x'];
		assert.htmlEqual(target.innerHTML, 'foo');
	}
};
