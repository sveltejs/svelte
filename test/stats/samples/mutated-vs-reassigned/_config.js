export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'count',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: true,
				referenced: true,
				writable: true
			},
			{
				name: 'user',
				export_name: null,
				injected: false,
				module: false,
				mutated: true,
				reassigned: false,
				referenced: true,
				writable: false
			}
		]);
	}
};