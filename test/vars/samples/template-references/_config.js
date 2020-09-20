export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				name: 'Bar',
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: false,
			},
			{
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				name: 'foo',
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true,
			},
			{
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				name: 'baz',
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true,
			},
		]);
	},
};
