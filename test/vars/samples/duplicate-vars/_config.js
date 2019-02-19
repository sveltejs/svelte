export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
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
