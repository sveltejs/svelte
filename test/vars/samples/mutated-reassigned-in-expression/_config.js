export default {
	test(assert, vars) {
		assert.deepEqual(vars, [
			{
				name: "a",
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
				name: "b",
				export_name: null,
				injected: false,
				module: false,
				mutated: true,
				reassigned: false,
				referenced: true,
				referenced_from_script: false,
				writable: true
			},
			{
				name: "c",
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
				name: "d",
				export_name: null,
				injected: false,
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
