export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'name',
				kind: 'let',
				import_name: null,
				export_name: 'name',
				source: null,
				module: false,
				mutated: true,
				referenced: true
			},
			{
				name: 'cats',
				kind: 'let',
				import_name: null,
				export_name: 'cats',
				source: null,
				module: false,
				mutated: true,
				referenced: true
			},
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
				name: 'bar',
				kind: 'let',
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