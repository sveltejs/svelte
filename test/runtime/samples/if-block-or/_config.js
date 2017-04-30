export default {
	data: {
		a: true,
		b: false
	},

	html: '<p>i am visible</p>',

	test ( assert, component, target ) {
		component.set({ a: false });
		assert.htmlEqual( target.innerHTML, '' );
		component.set({ b: true });
		assert.htmlEqual( target.innerHTML, '<p>i am visible</p>' );
	}
};
