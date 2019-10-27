export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'count',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: true,
				referenced: true,
				referenced_from_script: false,
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
				referenced_from_script: false,
				writable: false
			}
		]);
	}
};