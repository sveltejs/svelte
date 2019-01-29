export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				kind: 'let',
				import_name: null,
				export_name: null,
				source: null,
				module: false,
				mutated: false,
				referenced: false
			},
			{
				name: '$foo',
				kind: 'injected',
				import_name: null,
				export_name: null,
				source: null,
				module: false,
				mutated: true,
				referenced: true
			}
		]);
	}
};
