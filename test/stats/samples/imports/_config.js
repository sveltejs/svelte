export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'x',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				writable: false
			},
			{
				name: 'y',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				writable: false
			},
			{
				name: 'z',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				writable: false
			}
		]);
	}
};