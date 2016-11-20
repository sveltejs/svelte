import * as assert from 'assert';

export default {
	data: {
		items: [
			'one',
			'two',
			'three'
		]
	},
	html: `<div><input><p>one</p></div><div><input><p>two</p></div><div><input><p>three</p></div><!--#each items-->`,
	test ( component, target, window ) {
		const inputs = [ ...target.querySelectorAll( 'input' ) ];
		const items = component.get( 'items' );
		const event = new window.Event( 'input' );

		assert.equal( inputs[0].value, 'one' );

		inputs[1].value = 'four';
		inputs[1].dispatchEvent( event );

		assert.equal( items[1], 'four' );
		assert.equal( target.innerHTML, `<div><input><p>one</p></div><div><input><p>four</p></div><div><input><p>three</p></div><!--#each items-->` );

		items[2] = 'five';

		component.set({ items });
		assert.equal( inputs[2].value, 'five' );
		assert.equal( target.innerHTML, `<div><input><p>one</p></div><div><input><p>four</p></div><div><input><p>five</p></div><!--#each items-->` );
	}
};
