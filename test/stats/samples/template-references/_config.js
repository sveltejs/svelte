export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				kind: 'injected',
				import_name: null,
				export_name: 'foo',
				source: null,
				referenced: true,
				module: false,
				mutated: true
			},
			{
				name: 'Bar',
				kind: 'injected',
				import_name: null,
				export_name: 'Bar',
				source: null,
				referenced: true,
				module: false,
				mutated: true
			},
			{
				name: 'baz',
				kind: 'injected',
				import_name: null,
				export_name: 'baz',
				source: null,
				referenced: true,
				module: false,
				mutated: true
			}
		]);
	},
};
