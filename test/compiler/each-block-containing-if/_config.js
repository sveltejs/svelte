export default {
	test ( assert, component, target ) {
		const items = component.get( 'items' );
		items.forEach( item => item.completed = false );

		component.set({ currentFilter: 'all' });

		assert.htmlEqual( target.innerHTML, `
			<ul><li>one</li><li>two</li><li>three</li></ul>`
		);
	}
};
