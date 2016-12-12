export default {
	data: {
		name: 'world'
	},

	html: '<h1>Hello world!</h1>',

	test ( assert, component, target ) {
		component.set({ name: 'everybody' });
		assert.htmlEqual( target.innerHTML, '<h1>Hello everybody!</h1>' );

		component.teardown();
		assert.htmlEqual( target.innerHTML, '' );
	}
};
