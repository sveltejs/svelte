export default {
	test(assert, stats) {
		assert.deepEqual(stats.props.sort(), ['cats', 'foo', 'name']);
	}
};