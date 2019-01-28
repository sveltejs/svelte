export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				kind: 'injected',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: 'foo',
				referenced: true,
				module: false,
				mutated: true
			},
			{
				name: 'Bar',
				kind: 'injected',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: 'Bar',
				referenced: true,
				module: false,
				mutated: true
			},
			{
				name: 'baz',
				kind: 'injected',
				import_type: null,
				imported_as: null,
				source: null,
				exported_as: 'baz',
				referenced: true,
				module: false,
				mutated: true
			}
		]);
	},
};
