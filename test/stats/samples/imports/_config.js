export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'x',
				kind: 'import',
				import_type: 'default',
				imported_as: 'default',
				source: 'x',
				exported_as: null,
				module: false,
				mutated: false,
				referenced: true
			},
			{
				name: 'y',
				kind: 'import',
				import_type: 'default',
				imported_as: 'y',
				source: 'y',
				exported_as: null,
				module: false,
				mutated: false,
				referenced: true
			},
			{
				name: 'z',
				kind: 'import',
				import_type: 'default',
				imported_as: '*',
				source: 'z',
				exported_as: null,
				module: false,
				mutated: false,
				referenced: true
			}
		]);
	}
};