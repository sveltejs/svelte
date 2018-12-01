export default {
	test(assert, stats) {
		assert.equal(stats.templateReferences.size, 3);
		assert.ok(stats.templateReferences.has('foo'));
		assert.ok(stats.templateReferences.has('Bar'));
		assert.ok(stats.templateReferences.has('baz'));
	},
};
