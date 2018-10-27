export default {
	test(assert, stats) {
		assert.equal(typeof stats.timings, 'object');
		assert.equal(typeof stats.timings.total, 'number');
	}
};