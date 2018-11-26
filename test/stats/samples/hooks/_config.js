export default {
	test(assert, stats) {
		assert.deepEqual(stats.hooks, {
			oncreate: true,
			onDestroy: false,
			onstate: false,
			afterUpdate: false
		});
	}
};