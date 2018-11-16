const items = [ { id: 'a' }, { id: 'b' } ];

export default {
	'skip-ssr': true,

	props: {
		items
	},

	test ( assert, component, target ) {
		const items = component.items;

		assert.equal( items[0].id, 'a' );
		assert.equal( items[1].id, 'b' );
	}
};
