export default {
	get props() {
		return { items: [] };
	},

	html: '',

	test({ assert, component, target }) {
		component.items = ['x'];
		assert.htmlEqual(target.innerHTML, 'foo');
	}
};
