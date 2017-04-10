export default {
	data: {
		visible: true
	},

	html: '<p>i am visible</p>',

	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.htmlEqual( target.innerHTML, '' );
		component.set({ visible: true });
		assert.htmlEqual( target.innerHTML, '<p>i am visible</p>' );
	}
};
