export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'x',
				kind: 'import',
				import_name: 'default',
				export_name: null,
				source: 'x',
				module: false,
				mutated: false,
				referenced: false
			},
			{
				name: 'y',
				kind: 'import',
				import_name: 'y',
				export_name: null,
				source: 'y',
				module: false,
				mutated: false,
				referenced: false
			},
			{
				name: 'z',
				kind: 'import',
				import_name: '*',
				export_name: null,
				source: 'z',
				module: false,
				mutated: false,
				referenced: false
			}
		]);
	}
};