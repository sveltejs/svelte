export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				writable: true
			},
			{
				name: '$foo',
				export_name: null,
				injected: true,
				module: false,
				mutated: true,
				reassigned: false,
				referenced: true,
				writable: true
			}
		]);
	}
};
