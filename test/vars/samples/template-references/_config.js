export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				export_name: 'foo',
				injected: false,
				module: false,
				mutated: false,
				name: 'foo',
				reassigned: false,
				referenced: true,
				writable: true,
			},
			{
				export_name: 'Bar',
				injected: false,
				module: false,
				mutated: false,
				name: 'Bar',
				reassigned: false,
				referenced: true,
				writable: true,
			},
			{
				export_name: 'baz',
				injected: false,
				module: false,
				mutated: false,
				name: 'baz',
				reassigned: false,
				referenced: true,
				writable: true,
			},
		]);
	},
};
