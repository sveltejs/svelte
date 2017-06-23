export default {
	data: {
		animals: [],
		foo: 'something else'
	},

	html: `
		before
		<p>no animals, but rather something else</p>
		after
	`,

	test ( assert, component, target ) {
		component.set({ animals: ['wombat'] });
		assert.htmlEqual( target.innerHTML, `
			before
			<p>wombat</p>
			after
		` );
	}
};
