export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},
	html: '<p>alpaca</p><p>baboon</p><p>capybara</p><!---->',
	test ( assert, component, target ) {
		component.set({ animals: [ 'alpaca', 'baboon', 'caribou', 'dogfish' ] });
		assert.equal( target.innerHTML, '<p>alpaca</p><p>baboon</p><p>caribou</p><p>dogfish</p><!---->' );
		component.set({ animals: [] });
		assert.equal( target.innerHTML, '<!---->' );
	}
};
