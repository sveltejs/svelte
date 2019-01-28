export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'name',
				kind: 'let',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: 'name',
				module: false,
				mutated: false,
				referenced: true
			},
			{
				name: 'cats',
				kind: 'let',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: 'name',
				module: false,
				mutated: false,
				referenced: true
			},
			{
				name: 'foo',
				kind: 'let',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: null,
				module: false,
				mutated: false,
				referenced: true
			},
			{
				name: 'bar',
				kind: 'let',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: null,
				module: false,
				mutated: false,
				referenced: true
			}
		]);
	}
};