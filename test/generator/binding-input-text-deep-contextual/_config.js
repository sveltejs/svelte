export default {
	data: {
		items: [
			{ description: 'one' },
			{ description: 'two' },
			{ description: 'three' }
		]
	},
	html: `<div><input><p>one</p></div><div><input><p>two</p></div><div><input><p>three</p></div><!--#each items-->`,
	test ( assert, component, target, window ) {
		const inputs = [ ...target.querySelectorAll( 'input' ) ];

		assert.equal( inputs[0].value, 'one' );

		const event = new window.Event( 'input' );

		inputs[1].value = 'four';
		inputs[1].dispatchEvent( event );

		assert.equal( target.innerHTML, `<div><input><p>one</p></div><div><input><p>four</p></div><div><input><p>three</p></div><!--#each items-->` );

		const items = component.get( 'items' );
		items[2].description = 'five';

		component.set({ items });
		assert.equal( inputs[2].value, 'five' );
		assert.equal( target.innerHTML, `<div><input><p>one</p></div><div><input><p>four</p></div><div><input><p>five</p></div><!--#each items-->` );
	}
};
