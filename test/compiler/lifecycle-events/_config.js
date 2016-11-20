import * as assert from 'assert';

export default {
	test ( component ) {
		assert.deepEqual( component.events, [ 'render' ]);
		component.teardown();
		assert.deepEqual( component.events, [ 'render', 'teardown' ]);
	}
};
