export default {
	test ( assert, component ) {
		assert.deepEqual( component.events, [ 'render' ]);
		component.destroy();
		assert.deepEqual( component.events, [ 'render', 'teardown' ]);
	}
};
