export default {
	test(assert, stats) {
		assert.deepEqual(stats.hooks, {
			oncreate: true,
			onDestroy: false,
			onstate: false,
			afterRender: false
		});
	}
};