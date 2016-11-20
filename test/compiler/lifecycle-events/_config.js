import * as assert from 'assert';

export default {
	test ( component ) {
		assert.deepEqual( component.events, [ 'init', 'render' ]);
		component.teardown();
		assert.deepEqual( component.events, [ 'init', 'render', 'teardown' ]);
	}
};
