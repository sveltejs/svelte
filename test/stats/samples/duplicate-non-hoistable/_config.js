export default {
	test(assert, stats) {
		assert.deepEqual(stats.vars, [
			{
				name: 'console',
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
