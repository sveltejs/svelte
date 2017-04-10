export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},

	html: '(alpaca)(baboon)(capybara)',

	test ( assert, component, target ) {
		component.set({ animals: [ 'caribou', 'dogfish' ] });
		assert.htmlEqual( target.innerHTML, '(caribou)(dogfish)' );
		component.set({ animals: [] });
		assert.htmlEqual( target.innerHTML, '' );
	}
};
