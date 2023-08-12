export default {
	get props() {
		return { prop: 'a' };
	},

	html: 'a',

	test({ assert, component, target }) {
		component.prop = 'b';
		assert.htmlEqual(target.innerHTML, 'b');
	}
};
