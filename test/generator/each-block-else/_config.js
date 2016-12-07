export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ],
		foo: 'something else'
	},
	html: 'before\n<p>alpaca</p><p>baboon</p><p>capybara</p>\nafter',
	test ( assert, component, target ) {
		component.set({ animals: [] });
		assert.htmlEqual( target.innerHTML, 'before\n<p>no animals, but rather something else</p>\nafter' );

		component.set({ foo: 'something other' });
		assert.htmlEqual( target.innerHTML, 'before\n<p>no animals, but rather something other</p>\nafter' );
		
		component.set({ animals: ['wombat'] });
		assert.htmlEqual( target.innerHTML, 'before\n<p>wombat</p>\nafter' );
	}
};
