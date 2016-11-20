import * as assert from 'assert';

export default {
	data: {
		items: [
			{ description: 'one', completed: true },
			{ description: 'two', completed: false },
			{ description: 'three', completed: false }
		]
	},
	html: `<div><input type="checkbox"><p>one</p></div><div><input type="checkbox"><p>two</p></div><div><input type="checkbox"><p>three</p></div><!--#each items-->\n\n<p>1 completed</p>`,
	test ( component, target, window ) {
		const inputs = [ ...target.querySelectorAll( 'input' ) ];

		assert.ok( inputs[0].checked );
		assert.ok( !inputs[1].checked );
		assert.ok( !inputs[2].checked );

		const event = new window.Event( 'change' );

		inputs[1].checked = true;
		inputs[1].dispatchEvent( event );

		assert.equal( component.get( 'numCompleted' ), 2 );
		assert.equal( target.innerHTML, `<div><input type="checkbox"><p>one</p></div><div><input type="checkbox"><p>two</p></div><div><input type="checkbox"><p>three</p></div><!--#each items-->\n\n<p>2 completed</p>` );

		const items = component.get( 'items' );
		items[2].completed = true;

		component.set({ items });
		assert.ok( inputs[2].checked );
		assert.equal( target.innerHTML, `<div><input type="checkbox"><p>one</p></div><div><input type="checkbox"><p>two</p></div><div><input type="checkbox"><p>three</p></div><!--#each items-->\n\n<p>3 completed</p>` );
	}
};
