export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				name: 'hoistable_foo',
				reassigned: false,
				referenced: true,
				writable: false
			},
			{
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				name: 'foo',
				reassigned: false,
				referenced: true,
				writable: true
			}
		]);
	}
};
