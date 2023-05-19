export default {
	get props() {
		return { hidden: true };
	},
	html: '<div hidden />',
	test({ assert, component, target }) {
		component.hidden = false;
		assert.htmlEqual(target.innerHTML, '<div />');
	}
};
