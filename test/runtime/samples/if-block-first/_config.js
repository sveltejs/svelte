export default {
	data: {
		visible: false
	},

	html: '<div><div>before me</div></div>',

	test ( assert, component, target ) {
		component.set({ visible: true });
		assert.htmlEqual(target.innerHTML, '<div><div>i am visible</div><div>before me</div></div>' );
	}
};
