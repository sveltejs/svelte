export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'foo',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: false,
				writable: true
			},
			{
				name: '$foo',
				export_name: null,
				injected: true,
				module: false,
				mutated: true,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true
			}
		]);
	}
};
