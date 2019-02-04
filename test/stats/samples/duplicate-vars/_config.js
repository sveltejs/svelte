export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'foo',
				injected: false,
				export_name: null,
				module: true,
				mutated: false,
				reassigned: false,
				referenced: false,
				writable: true
			},
			{
				name: 'foo',
				injected: false,
				export_name: null,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				writable: true
			}
		]);
	},
};
