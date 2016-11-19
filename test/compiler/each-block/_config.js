import * as assert from 'assert';

export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},
	html: '<p>alpaca</p><p>baboon</p><p>capybara</p><!--#each animals-->',
	test ( component, target ) {
		component.set({ animals: [ 'alpaca', 'baboon', 'caribou', 'dogfish' ] });
		assert.equal( target.innerHTML, '<p>alpaca</p><p>baboon</p><p>caribou</p><p>dogfish</p><!--#each animals-->' );
		component.set({ animals: [] });
		assert.equal( target.innerHTML, '<!--#each animals-->' );
	}
};
