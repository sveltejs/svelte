export default {
	test ( assert, component ) {
		assert.deepEqual( component.events, [ 'render' ]);
		component.teardown();
		assert.deepEqual( component.events, [ 'render', 'teardown' ]);
	}
};
