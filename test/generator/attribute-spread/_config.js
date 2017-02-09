export default {
	html: '<input type="text" value="Hello World"/>',

	test ( assert, component, target ) {
		component.set({
			options: {
				type: 'text',
				value: 'changed'
			}
		});

		assert.htmlEqual( target.innerHTML, `<input type="text" value="changed"/>` );
		component.teardown();
	}
};
