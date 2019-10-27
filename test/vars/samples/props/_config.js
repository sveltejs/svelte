export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: 'name',
				export_name: 'name',
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'cats',
				export_name: 'cats',
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true
			},
			{
				name: 'foo',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: false,
				referenced: false,
				referenced_from_script: true,
				writable: true
			},
			{
				name: 'bar',
				export_name: null,
				injected: false,
				module: false,
				mutated: false,
				reassigned: true,
				referenced: true,
				referenced_from_script: true,
				writable: true
			}
		]);
	}
};