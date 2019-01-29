export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				kind: 'implicit',
				import_name: null,
				export_name: 'foo',
				source: null,
				referenced: true,
				module: false,
				mutated: true
			}
		]);
	},
};
