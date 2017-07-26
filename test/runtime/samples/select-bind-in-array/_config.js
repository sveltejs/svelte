const items = [ { id: 'a' }, { id: 'b' } ];

export default {
	'skip-ssr': true,

	data: {
		items
	},

	test ( assert, component, target ) {
		const items = component.get('items');

		assert.equal( items[0].id, 'a' );
		assert.equal( items[1].id, 'b' );
	}
};
