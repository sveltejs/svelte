export default {
	props: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},

	html: '(alpaca)(baboon)(capybara)',

	test({ assert, component, target }) {
		component.animals = [ 'caribou', 'dogfish' ];
		assert.htmlEqual( target.innerHTML, '(caribou)(dogfish)' );
		component.animals = [];
		assert.htmlEqual( target.innerHTML, '' );
	}
};
