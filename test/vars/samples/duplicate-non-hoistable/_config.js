export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
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
