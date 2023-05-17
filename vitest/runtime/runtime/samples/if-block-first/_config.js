export default {
	get props() {
		return { visible: false };
	},

	html: '<div><div>before me</div></div>',

	test({ assert, component, target }) {
		component.visible = true;
		assert.htmlEqual(target.innerHTML, '<div><div>i am visible</div><div>before me</div></div>');
	}
};
