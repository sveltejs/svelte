export default {
	data: {
		todos: [
			{ id: 123, description: 'implement keyed each blocks' },
			{ id: 234, description: 'implement client-side hydration' }
		]
	},

	html: '<p>implement keyed each blocks</p><p>implement client-side hydration</p>',

	test ( assert, component, target ) {
		const [ p1, p2 ] = target.querySelectorAll( 'p' );

		component.set({
			todos: [
				{ id: 234, description: 'implement client-side hydration' }
			]
		});
		assert.htmlEqual( target.innerHTML, '<p>implement client-side hydration</p>' );

		const [ p3 ] = target.querySelectorAll( 'p' );

		assert.ok( !target.contains( p1 ), 'first <p> element should be removed' );
		assert.equal( p2, p3, 'second <p> element should be retained' );

		component.teardown();
	}
};
