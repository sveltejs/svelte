export default {
	test(assert, stats) {
		assert.deepEqual(stats.hooks, {
			oncreate: true,
			ondestroy: false,
			onstate: false,
			onupdate: false
		});
	}
};